import { useEffect, useState } from 'react';
import type { WalletState } from './sdk/types';
import { buyToken, getTokenBalance, checkWhitelist, checkSaleActive } from './sdk/explorerContract';
import { updateWalletState } from './sdk/index';
import { TOKEN_IDS, TOKEN_CONFIG, NETWORK_CONFIG, CONTRACT_ADDRESSES, getExplorerUrls, type TokenId } from './contracts/config';
import {
  connectMetaMask,
  isMetaMaskInstalled,
  getCurrentProvider,
  switchToNetwork,
  type WalletType
} from './utils/walletConnection';
import { diagnoseWalletEnvironment } from './utils/walletDiagnostics';
import './App.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false });
  const [selectedToken, setSelectedToken] = useState<TokenId>(TOKEN_IDS.POWER);
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saleActive, setSaleActive] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [balances, setBalances] = useState<Record<TokenId, number>>({
    [TOKEN_IDS.POWER]: 0,
    [TOKEN_IDS.OIL]: 0,
    [TOKEN_IDS.EXPLORER]: 0,
  });
  const [txStatus, setTxStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' }>({
    message: '',
    type: 'info',
  });

  // Check wallet state
  useEffect(() => {
    // Run diagnostics on first load
    console.log('🚀 App loaded - Running wallet diagnostics...');
    diagnoseWalletEnvironment();

    const checkWallet = async () => {
      const provider = getCurrentProvider();
      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            const walletState: WalletState = {
              connected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
            };
            setWalletState(walletState);
            // Sync with SDK state
            updateWalletState(walletState);
          }
        } catch (error) {
          console.error('Error checking wallet:', error);
        }
      }
    };
    checkWallet();

    // Event handlers
    const handleAccountsChanged = (accounts: string[]) => {
      console.log('Accounts changed:', accounts);
      if (accounts.length > 0) {
        const newState: WalletState = { connected: true, address: accounts[0], chainId: walletState.chainId };
        setWalletState(newState);
        updateWalletState(newState);
        setTxStatus({ message: '', type: 'info' });
      } else {
        const disconnectedState: WalletState = { connected: false };
        setWalletState(disconnectedState);
        updateWalletState(disconnectedState);
        setTxStatus({ message: 'Wallet disconnected', type: 'info' });
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed to:', chainId);
      window.location.reload();
    };

    // Listen for account and chain changes
    const provider = getCurrentProvider();
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
    }

    // Cleanup event listeners
    return () => {
      const provider = getCurrentProvider();
      if (provider && provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Load balances and whitelist status when wallet connects
  useEffect(() => {
    const loadData = async () => {
      if (walletState.connected && walletState.address) {
        // Check whitelist
        const whitelistResult = await checkWhitelist(walletState.address);
        if (whitelistResult.ok) {
          setIsWhitelisted(whitelistResult.data);
        }

        // Load balances for all tokens
        for (const tokenId of [TOKEN_IDS.POWER, TOKEN_IDS.OIL, TOKEN_IDS.EXPLORER]) {
          const balanceResult = await getTokenBalance(walletState.address, tokenId);
          if (balanceResult.ok) {
            setBalances(prev => ({ ...prev, [tokenId]: balanceResult.data }));
          }
        }
      }
    };

    loadData();
  }, [walletState.connected, walletState.address]);

  // Check sale status
  useEffect(() => {
    const checkSale = async () => {
      const saleResult = await checkSaleActive();
      if (saleResult.ok) {
        setSaleActive(saleResult.data);
      }
    };
    checkSale();
  }, []);

  // Show wallet selector modal
  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  // Connect with selected wallet type
  const handleWalletSelect = async (walletType: WalletType) => {
    console.log('🎯 [handleWalletSelect] Selected wallet type:', walletType);

    setShowWalletModal(false);
    setLoading(true);
    setTxStatus({ message: '', type: 'info' });

    try {
      let result;

      if (walletType === 'metamask') {
        console.log('➡️ Connecting to MetaMask...');
        result = await connectMetaMask();
      } else if (walletType === 'walletconnect') {
        console.log('➡️ WalletConnect selected');
        setTxStatus({
          message: 'WalletConnect support coming soon! Please use MetaMask for now.',
          type: 'info',
        });
        setLoading(false);
        return;
      } else {
        throw new Error('Unknown wallet type');
      }

      if (!result.success) {
        console.error('❌ Connection failed:', result.error);
        setTxStatus({
          message: result.error || 'Failed to connect wallet',
          type: 'error',
        });
        setLoading(false);
        return;
      }

      console.log('✅ Connection successful:', result);

      // Check network and switch if needed
      if (result.chainId !== NETWORK_CONFIG.chainId) {
        const networkSwitched = await switchToNetwork(
          NETWORK_CONFIG.chainId,
          NETWORK_CONFIG.chainIdHex,
          {
            chainId: NETWORK_CONFIG.chainIdHex,
            chainName: NETWORK_CONFIG.chainName,
            nativeCurrency: NETWORK_CONFIG.nativeCurrency,
            rpcUrls: [NETWORK_CONFIG.publicRpcUrl],
            blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
          }
        );

        if (!networkSwitched) {
          setTxStatus({
            message: 'Please switch to OP Sepolia network manually',
            type: 'error',
          });
          return;
        }
      }

      const newWalletState: WalletState = {
        connected: true,
        address: result.address!,
        chainId: NETWORK_CONFIG.chainId,
      };

      // Update local state
      setWalletState(newWalletState);

      // Sync with SDK state for buyToken to work
      updateWalletState(newWalletState);

      setTxStatus({
        message: 'Wallet connected successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setTxStatus({
        message: error.message || 'Failed to connect wallet',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    const disconnectedState: WalletState = { connected: false };
    setWalletState(disconnectedState);
    // Sync with SDK state
    updateWalletState(disconnectedState);
    setTxStatus({ message: '', type: 'info' });
  };

  const handleBuy = async () => {
    if (!walletState.connected) {
      await handleConnectWallet();
      return;
    }

    const tokenInfo = TOKEN_CONFIG[selectedToken];

    // Check whitelist requirement
    if (tokenInfo.whitelistRequired && !isWhitelisted) {
      setTxStatus({
        message: 'You are not whitelisted for this token',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setTxStatus({
      message: 'Preparing transaction...',
      type: 'info',
    });

    const result = await buyToken(selectedToken, amount);

    if (result.ok) {
      setTxStatus({
        message: `Transaction successful! Hash: ${result.data.txHash}`,
        type: 'success',
      });

      // Refresh balance
      if (walletState.address) {
        const balanceResult = await getTokenBalance(walletState.address, selectedToken);
        if (balanceResult.ok) {
          setBalances(prev => ({ ...prev, [selectedToken]: balanceResult.data }));
        }
      }
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

  const selectedTokenInfo = TOKEN_CONFIG[selectedToken];
  const totalCost = parseFloat(selectedTokenInfo.priceETH) * amount;

  return (
    <div className="app">
      {/* Wallet Selector Modal */}
      {showWalletModal && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletModal(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <h2 className="wallet-modal-title">Connect Wallet</h2>
              <button
                className="wallet-modal-close"
                onClick={() => setShowWalletModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="wallet-options">
              {/* MetaMask Option */}
              <div
                className="wallet-option"
                onClick={() => handleWalletSelect('metamask')}
              >
                <div className="wallet-option-icon">
                  🦊
                </div>
                <div className="wallet-option-info">
                  <h3 className="wallet-option-name">MetaMask</h3>
                  <p className="wallet-option-description">
                    {isMetaMaskInstalled()
                      ? 'Connect with MetaMask extension'
                      : 'MetaMask not installed'}
                  </p>
                </div>
                <span className="wallet-option-arrow">→</span>
              </div>

              {/* WalletConnect Option */}
              <div
                className="wallet-option"
                onClick={() => handleWalletSelect('walletconnect')}
              >
                <div className="wallet-option-icon">
                  🔗
                </div>
                <div className="wallet-option-info">
                  <h3 className="wallet-option-name">WalletConnect</h3>
                  <p className="wallet-option-description">
                    Scan with mobile wallet
                  </p>
                </div>
                <span className="wallet-option-arrow">→</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="header">
        <h1>Explorer Protocol - Token Sale</h1>
        <p>OP Sepolia Testnet</p>
      </header>

      <main className="main">
        {/* Wallet Connection */}
        <div className="wallet-section" data-testid="wallet-section">
          {walletState.connected ? (
            <div className="wallet-connected">
              <span data-testid="wallet-address">
                Connected: {formatAddress(walletState.address!)}
                {isWhitelisted && <span className="whitelist-badge">Whitelisted</span>}
              </span>
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

        {/* Sale Status */}
        <div className="sale-status">
          <span className={saleActive ? 'status-active' : 'status-inactive'}>
            Sale Status: {saleActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Token Selection */}
        <div className="token-selection">
          <h2>Select Token</h2>
          <div className="token-grid">
            {([TOKEN_IDS.POWER, TOKEN_IDS.OIL, TOKEN_IDS.EXPLORER] as TokenId[]).map((tokenId) => {
              const tokenInfo = TOKEN_CONFIG[tokenId];
              return (
                <div
                  key={tokenId}
                  className={`token-card ${selectedToken === tokenId ? 'selected' : ''}`}
                  onClick={() => setSelectedToken(tokenId)}
                >
                  <h3>{tokenInfo.name}</h3>
                  <p className="token-price">{tokenInfo.priceETH} ETH</p>
                  <p className="token-description">{tokenInfo.description}</p>
                  {tokenInfo.whitelistRequired && (
                    <p className="whitelist-required">Whitelist Required</p>
                  )}
                  {walletState.connected && (
                    <p className="token-balance">Balance: {balances[tokenId]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="amount-section">
          <h2>Amount</h2>
          <input
            type="number"
            min="1"
            max="100"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="amount-input"
          />
          <p className="total-cost">Total Cost: {totalCost.toFixed(7)} ETH</p>
        </div>

        {/* Buy Button */}
        <div className="mint-section">
          <button
            onClick={handleBuy}
            className="btn btn-mint"
            disabled={loading || !saleActive}
            data-testid="buy-btn"
          >
            {loading
              ? 'Processing...'
              : !saleActive
              ? 'Sale Inactive'
              : walletState.connected
              ? `Buy ${amount} ${selectedTokenInfo.name}`
              : 'Connect Wallet to Buy'}
          </button>
        </div>

        {/* Transaction Status */}
        {txStatus.message && (
          <div className={`tx-status tx-status-${txStatus.type}`} data-testid="tx-status">
            {txStatus.message}
          </div>
        )}

        {/* View on Block Explorer */}
        {walletState.connected && (
          <div className="explorer-links">
            <a
              href={getExplorerUrls(CONTRACT_ADDRESSES.Minter, 'address')}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Minter Contract
            </a>
            <a
              href={getExplorerUrls(CONTRACT_ADDRESSES.ExplorerToken, 'address')}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Token Contract
            </a>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Explorer Protocol - Powered by OP Sepolia</p>
      </footer>
    </div>
  );
}

export default App;
