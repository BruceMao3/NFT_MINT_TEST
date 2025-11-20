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
      setLoading(true);
      setError(null);

      const result = await getDashboardOverview(chainId);

      if (result.ok && result.data) {
        const parsedStats = parseOverviewStats(result.data);
        setStats(parsedStats);
      } else {
        setError(result.error || 'Failed to load dashboard data');
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
        <div className="dashboard-error">
          Failed to load dashboard: {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Overall Stats */}
      <div className="dashboard-overall">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-label">Total Raised</div>
          <div className="dashboard-stat-value">{stats.totalRaisedETH.toFixed(4)} ETH</div>
        </div>

        {stats.uniqueAddresses > 0 && (
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-label">Unique Addresses</div>
            <div className="dashboard-stat-value">{stats.uniqueAddresses}</div>
          </div>
        )}
      </div>

      {/* NFT Progress */}
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
                style={{ width: `${nft.progress}%` }}
              >
                <span className="progress-bar-text">{nft.progress.toFixed(1)}%</span>
              </div>
            </div>

            <div className="nft-progress-details">
              <span className="nft-progress-remaining">
                Remaining: {nft.remaining}
              </span>
            </div>

            {/* User Balance and Vesting */}
            {userAddress && (
              <div className="nft-user-info">
                <div className="nft-user-balance">
                  Your Balance: {userBalances[nft.tokenId] || 0}
                </div>
                {userBalances[nft.tokenId] > 0 && (
                  <div className="nft-vesting">
                    <span className="nft-vesting-label">Vesting: </span>
                    <span className={`nft-vesting-time ${nft.isVested ? 'vested' : ''}`}>
                      {vestingCountdowns[nft.tokenId] || 'Loading...'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

