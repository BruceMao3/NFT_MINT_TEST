import { useEffect, useState } from 'react';
import sdk, { type NftContractInfo, type NftStats, type WalletState, TxStatus } from './sdk';
import './App.css';

function App() {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false });
  const [nftInfo, setNftInfo] = useState<NftContractInfo | null>(null);
  const [nftStats, setNftStats] = useState<NftStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
    message: '',
    type: 'info',
  });

  // Initialize SDK
  useEffect(() => {
    sdk.init({
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
      contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
      rpcUrl: import.meta.env.VITE_RPC_URL,
      walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
      testMode: import.meta.env.VITE_TEST_MODE === 'true',
      mockWalletAddress: import.meta.env.VITE_MOCK_WALLET_ADDRESS,
    });

    // Subscribe to wallet state changes
    const unsubscribe = sdk.onWalletStateChange((state) => {
      setWalletState(state);
    });

    // Initial wallet state
    setWalletState(sdk.getWalletState());

    // Fetch initial data
    fetchNftData();

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchNftData = async () => {
    const infoResult = await sdk.getNftInfo();
    if (infoResult.ok) {
      setNftInfo(infoResult.data);
    }

    const statsResult = await sdk.getNftStats();
    if (statsResult.ok) {
      setNftStats(statsResult.data);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    const result = await sdk.connectWallet();
    setLoading(false);

    if (!result.ok) {
      setTxStatus({
        message: result.message,
        type: 'error',
      });
    }
  };

  const handleDisconnectWallet = async () => {
    await sdk.disconnectWallet();
    setTxStatus({
      message: '',
      type: 'info',
    });
  };

  const handleMint = async () => {
    if (!walletState.connected) {
      await handleConnectWallet();
      return;
    }

    setLoading(true);
    setTxStatus({
      message: 'Preparing transaction...',
      type: 'info',
    });

    const mintPrice = nftInfo?.mintPrice || '0.0001';
    const result = await sdk.mint(mintPrice);

    if (result.ok) {
      setTxStatus({
        message: `Transaction successful! Hash: ${result.data.txHash}`,
        type: 'success',
      });

      // Refresh stats after successful mint
      await fetchNftData();
    } else {
      setTxStatus({
        message: `Transaction failed: ${result.message}`,
        type: 'error',
      });
    }

    setLoading(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isSoldOut = nftStats?.remainingSupply === 0;

  return (
    <div className="app">
      <header className="header">
        <h1>NFT Mint Test</h1>
      </header>

      <main className="main">
        {/* Wallet Connection */}
        <div className="wallet-section" data-testid="wallet-section">
          {walletState.connected ? (
            <div className="wallet-connected">
              <span data-testid="wallet-address">Connected: {formatAddress(walletState.address!)}</span>
              <button onClick={handleDisconnectWallet} className="btn btn-secondary">
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="btn btn-primary"
              disabled={loading}
              data-testid="connect-wallet-btn"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* NFT Stats */}
        <div className="stats-section" data-testid="stats-section">
          <div className="stat-card">
            <div className="stat-label">NFT Total Supply</div>
            <div className="stat-value" data-testid="total-supply">
              {nftInfo?.totalSupply.toLocaleString() || '-'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Remaining Supply</div>
            <div className="stat-value" data-testid="remaining-supply">
              {nftStats?.remainingSupply.toLocaleString() || '-'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Minted</div>
            <div className="stat-value" data-testid="total-minted">
              {nftStats?.totalMinted.toLocaleString() || '-'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Funds Raised</div>
            <div className="stat-value" data-testid="total-funds">
              {nftStats?.totalFundsRaised || '-'} ETH
            </div>
          </div>
        </div>

        {/* Mint Button */}
        <div className="mint-section">
          <button
            onClick={handleMint}
            className="btn btn-mint"
            disabled={loading || isSoldOut}
            data-testid="mint-btn"
          >
            {loading
              ? 'Minting...'
              : isSoldOut
              ? 'Sold Out'
              : walletState.connected
              ? `Mint NFT (${nftInfo?.mintPrice || '0.0001'} ETH)`
              : 'Connect Wallet to Mint'}
          </button>
        </div>

        {/* Transaction Status */}
        {txStatus.message && (
          <div className={`tx-status tx-status-${txStatus.type}`} data-testid="tx-status">
            {txStatus.message}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>NFT Mint Test Project - Powered by Ethereum</p>
      </footer>
    </div>
  );
}

export default App;
