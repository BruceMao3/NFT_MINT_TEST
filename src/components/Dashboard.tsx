import { useEffect, useState } from 'react';
import { getDashboardOverview, parseOverviewStats, getVestingTimeRemaining, type OverallStats, type NFTStats } from '../services/dashboardApi';

interface DashboardProps {
  chainId: number;
  userAddress?: string;
  userBalances: { [key: string]: number };
}

export function Dashboard({ chainId, userAddress, userBalances }: DashboardProps) {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vestingCountdowns, setVestingCountdowns] = useState<{ [key: string]: string }>({});

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      // Don't show loading if we already have stats (for refresh)
      if (!stats) {
        setLoading(true);
      }
      setError(null);

      try {
        const result = await getDashboardOverview(chainId);

        if (result.ok && result.data) {
          const parsedStats = parseOverviewStats(result.data);
          setStats(parsedStats);
          setError(null);
        } else {
          // Only show error if we don't have cached stats
          if (!stats) {
            setError(result.error || 'Failed to load dashboard data');
          }
          console.warn('Dashboard update failed:', result.error);
        }
      } catch (err: any) {
        // Only show error if we don't have cached stats
        if (!stats) {
          setError(err.message || 'Network error');
        }
        console.error('Dashboard error:', err);
      }

      setLoading(false);
    };

    loadDashboard();

    // Refresh every 30 seconds
    const interval = setInterval(loadDashboard, 30000);
    return () => clearInterval(interval);
  }, [chainId]);

  // Update vesting countdowns every second
  useEffect(() => {
    if (!stats) return;

    const updateCountdowns = () => {
      const newCountdowns: { [key: string]: string } = {};
      stats.nftStats.forEach((nft) => {
        const vesting = getVestingTimeRemaining(nft.vestingTime);
        newCountdowns[nft.tokenId] = vesting.timeRemaining;
      });
      setVestingCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [stats]);

  if (loading && !stats) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="dashboard">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="dashboard-error-card">
          <div className="dashboard-error-icon">⚠️</div>
          <div className="dashboard-error-title">Unable to load dashboard</div>
          <div className="dashboard-error-message">{error}</div>
          <div className="dashboard-error-hint">
            The dashboard will show data once the API is available.
            <br />
            You can still connect your wallet and purchase tokens below.
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Format number for display
  const formatNumber = (num: number, decimals: number = 4): string => {
    if (num === 0) return '0';
    if (num < 0.0001) return num.toExponential(2);
    return num.toFixed(decimals);
  };

  // Check if there's any USD raised (USDT + USDC)
  const totalUSD = stats.totalRaisedUSDT + stats.totalRaisedUSDC;
  const hasETH = stats.totalRaisedETH > 0;
  const hasUSD = totalUSD > 0;

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Overall Stats */}
      <div className="dashboard-overall">
        {/* Total Gathered Tokens */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-label">Total Gathered</div>
          <div className="dashboard-stat-value">
            {hasETH && <div>{formatNumber(stats.totalRaisedETH)} ETH</div>}
            {hasUSD && <div>{formatNumber(totalUSD, 2)} USD</div>}
            {!hasETH && !hasUSD && <div>0</div>}
          </div>
          {(stats.totalRaisedUSDT > 0 || stats.totalRaisedUSDC > 0) && (
            <div className="dashboard-stat-detail">
              {stats.totalRaisedUSDT > 0 && <span>{formatNumber(stats.totalRaisedUSDT, 2)} USDT</span>}
              {stats.totalRaisedUSDT > 0 && stats.totalRaisedUSDC > 0 && <span> + </span>}
              {stats.totalRaisedUSDC > 0 && <span>{formatNumber(stats.totalRaisedUSDC, 2)} USDC</span>}
            </div>
          )}
        </div>

        {/* Unique Buyer Count */}
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-label">Participants</div>
          <div className="dashboard-stat-value">{stats.uniqueBuyerCount}</div>
          <div className="dashboard-stat-detail">Paid addresses only</div>
        </div>
      </div>

      {/* NFT Mint Progress */}
      <div className="dashboard-nfts">
        <h3 className="dashboard-section-title">NFT Mint Progress</h3>
        {stats.nftStats.map((nft: NFTStats) => (
          <div key={nft.tokenId} className="nft-progress-card">
            <div className="nft-progress-header">
              <h4 className="nft-progress-name">{nft.name}</h4>
              <span className="nft-progress-stats">
                {nft.minted} / {nft.maxSupply}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.min(nft.progress, 100)}%` }}
              >
                {nft.progress >= 5 && (
                  <span className="progress-bar-text">{nft.progress.toFixed(1)}%</span>
                )}
              </div>
              {nft.progress < 5 && (
                <span className="progress-bar-text-outside">{nft.progress.toFixed(1)}%</span>
              )}
            </div>

            {/* User Balance and Vesting */}
            {userAddress && userBalances[nft.tokenId] > 0 && (
              <div className="nft-user-info">
                <div className="nft-user-balance">
                  Your Balance: {userBalances[nft.tokenId]}
                </div>
                <div className="nft-vesting">
                  <span className="nft-vesting-label">Vesting: </span>
                  <span className={`nft-vesting-time ${nft.isVested ? 'vested' : ''}`}>
                    {vestingCountdowns[nft.tokenId] || 'Loading...'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

