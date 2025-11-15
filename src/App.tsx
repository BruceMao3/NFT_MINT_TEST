import { useEffect, useState } from 'react';
import { getWalletState, type WalletState } from './sdk/wallet';
import { buyToken, getTokenBalance, checkWhitelist, checkSaleActive } from './sdk/explorerContract';
import { TOKEN_IDS, TOKEN_CONFIG, NETWORK_CONFIG, CONTRACT_ADDRESSES, getExplorerUrls, type TokenId } from './contracts/config';
import './App.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Helper function to get the preferred Ethereum provider
function getEthereumProvider() {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  // If window.ethereum.providers exists, find MetaMask
  if (window.ethereum.providers?.length) {
    const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask);
    return metamask || window.ethereum.providers[0];
  }

  // Otherwise use window.ethereum directly
  return window.ethereum;
}

function App() {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false });
  const [selectedToken, setSelectedToken] = useState<TokenId>(TOKEN_IDS.POWER);
  const [amount, setAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [saleActive, setSaleActive] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
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
    const checkWallet = async () => {
      const provider = getEthereumProvider();
      if (provider) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            setWalletState({
              connected: true,
              address: accounts[0],
              chainId: parseInt(chainId, 16),
            });
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
        setWalletState(prev => ({ ...prev, connected: true, address: accounts[0] }));
        // Clear any error messages
        setTxStatus({ message: '', type: 'info' });
      } else {
        setWalletState({ connected: false });
        setTxStatus({ message: 'Wallet disconnected', type: 'info' });
      }
    };

    const handleChainChanged = (chainId: string) => {
      console.log('Chain changed to:', chainId);
      window.location.reload();
    };

    // Listen for account and chain changes
    const provider = getEthereumProvider();
    if (provider) {
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
    }

    // Cleanup event listeners
    return () => {
      const provider = getEthereumProvider();
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

  const handleConnectWallet = async () => {
    const provider = getEthereumProvider();

    if (!provider) {
      setTxStatus({
        message: 'Please install MetaMask or another Web3 wallet',
        type: 'error',
      });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ message: '', type: 'info' }); // Clear previous errors

      console.log('Requesting accounts from provider...');

      // Request accounts - this will show the wallet selector
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      });

      console.log('Accounts received:', accounts);

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }

      // Check if on correct network
      const chainId = await provider.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      console.log('Current chain ID:', currentChainId, 'Expected:', NETWORK_CONFIG.chainId);

      if (currentChainId !== NETWORK_CONFIG.chainId) {
        // Try to switch network
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: NETWORK_CONFIG.chainIdHex,
                    chainName: NETWORK_CONFIG.chainName,
                    nativeCurrency: NETWORK_CONFIG.nativeCurrency,
                    rpcUrls: [NETWORK_CONFIG.publicRpcUrl],
                    blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
                  },
                ],
              });
            } catch (addError) {
              throw new Error('Failed to add network');
            }
          } else {
            throw switchError;
          }
        }
      }

      setWalletState({
        connected: true,
        address: accounts[0],
        chainId: NETWORK_CONFIG.chainId,
      });

      setTxStatus({
        message: 'Wallet connected successfully',
        type: 'success',
      });
    } catch (error: any) {
      console.error('Wallet connection error:', error);

      // Handle user rejection
      if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
        setTxStatus({
          message: 'Connection cancelled',
          type: 'info',
        });
      } else {
        setTxStatus({
          message: error.message || 'Failed to connect wallet',
          type: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletState({ connected: false });
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
