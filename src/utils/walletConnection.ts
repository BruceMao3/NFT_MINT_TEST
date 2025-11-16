/**
 * Wallet Connection Utilities
 * Supports MetaMask and WalletConnect
 * Uses EIP-6963 for better multi-wallet support
 */

export type WalletType = 'metamask' | 'walletconnect';

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  chainId?: number;
  error?: string;
}

// EIP-6963 wallet provider interface
interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

// Store discovered EIP-6963 providers
const discoveredWallets = new Map<string, EIP6963ProviderDetail>();

/**
 * Listen for EIP-6963 wallet announcements
 */
function initEIP6963Discovery() {
  if (typeof window === 'undefined') return;

  console.log('🔍 [EIP-6963] Starting wallet discovery...');

  // Listen for wallet announcements
  window.addEventListener('eip6963:announceProvider', (event: any) => {
    const detail = event.detail as EIP6963ProviderDetail;
    console.log('📢 [EIP-6963] Wallet announced:', detail.info.name, detail.info.rdns);
    discoveredWallets.set(detail.info.rdns, detail);
  });

  // Request wallet announcements
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  console.log('✅ [EIP-6963] Discovery initialized');

  // Give wallets time to respond (some wallets may respond asynchronously)
  setTimeout(() => {
    if (discoveredWallets.size > 0) {
      console.log(`✅ [EIP-6963] Discovery complete: ${discoveredWallets.size} wallet(s) found`);
      console.log('   Wallets:', Array.from(discoveredWallets.keys()));
    } else {
      console.log('⚠️ [EIP-6963] No wallets responded after 200ms');
      console.log('   → Wallets may not support EIP-6963 or are slow to load');
    }
  }, 200);
}

// Initialize EIP-6963 discovery immediately
if (typeof window !== 'undefined') {
  initEIP6963Discovery();
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }

  // Check EIP-6963 discovered wallets first
  if (discoveredWallets.has('io.metamask')) {
    return true;
  }

  // Check if MetaMask is available
  if (window.ethereum.isMetaMask) {
    return true;
  }

  // Check in providers array
  if (window.ethereum.providers?.length) {
    return window.ethereum.providers.some((p: any) => p.isMetaMask);
  }

  return false;
}

/**
 * Get MetaMask provider specifically
 * Prioritizes EIP-6963 discovery for better multi-wallet support
 */
export function getMetaMaskProvider() {
  console.log('🔍 [getMetaMaskProvider] Searching for MetaMask...');

  // Method 1: Try EIP-6963 discovered MetaMask (most reliable)
  if (discoveredWallets.has('io.metamask')) {
    const metamaskWallet = discoveredWallets.get('io.metamask')!;
    console.log('✅ [EIP-6963] Found MetaMask:', metamaskWallet.info.name);
    console.log('   RDNS:', metamaskWallet.info.rdns);
    return metamaskWallet.provider;
  }

  console.log('⚠️ [EIP-6963] MetaMask not found via EIP-6963');
  console.log('   Discovered wallets:', Array.from(discoveredWallets.keys()));

  // Method 2: Check window.ethereum and providers array
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('❌ window.ethereum not found');
    return null;
  }

  console.log('🔍 Checking window.ethereum properties...');
  console.log('   window.ethereum.isMetaMask:', window.ethereum.isMetaMask);
  console.log('   window.ethereum.isTrust:', (window.ethereum as any).isTrust);
  console.log('   window.ethereum.providers:', window.ethereum.providers);

  // Method 3: If there are multiple providers, find MetaMask
  if (window.ethereum.providers?.length) {
    console.log('📦 Found multiple providers:', window.ethereum.providers.length);
    window.ethereum.providers.forEach((p: any, i: number) => {
      console.log(`  Provider ${i}:`, {
        isMetaMask: p.isMetaMask,
        isTrust: p.isTrust,
        isPhantom: p.isPhantom,
      });
    });

    // Filter out non-MetaMask providers explicitly
    const metamaskProvider = window.ethereum.providers.find(
      (p: any) => p.isMetaMask === true && !(p as any).isTrust
    );

    if (metamaskProvider) {
      console.log('✅ Found MetaMask in providers array');
      console.log('   isMetaMask:', metamaskProvider.isMetaMask);
      console.log('   isTrust:', (metamaskProvider as any).isTrust);
      return metamaskProvider;
    } else {
      console.warn('⚠️ MetaMask not found in providers array');
      // Try to find any provider with isMetaMask
      const anyMetaMask = window.ethereum.providers.find((p: any) => p.isMetaMask);
      if (anyMetaMask) {
        console.log('⚠️ Found provider with isMetaMask flag (might not be pure MetaMask)');
        return anyMetaMask;
      }
      return null;
    }
  }

  // Method 4: If it's MetaMask and not Trust, return it
  if (window.ethereum.isMetaMask && !(window.ethereum as any).isTrust) {
    console.log('✅ window.ethereum is MetaMask (and not Trust)');
    return window.ethereum;
  }

  console.error('❌ MetaMask not found');
  console.error('   Consider using EIP-6963 compatible wallet or check extension installation');
  return null;
}

/**
 * Connect to MetaMask
 * @param forceReconnect - If true, forces MetaMask to show account selection dialog
 */
export async function connectMetaMask(forceReconnect: boolean = false): Promise<WalletConnectionResult> {
  try {
    console.log('🦊 [connectMetaMask] Starting MetaMask connection...');

    const provider = getMetaMaskProvider();

    if (!provider) {
      console.error('❌ [connectMetaMask] MetaMask provider not found');
      return {
        success: false,
        error: 'MetaMask not installed. Please install MetaMask extension.',
      };
    }

    console.log('✅ [connectMetaMask] MetaMask provider found');
    console.log('Provider details:', {
      isMetaMask: provider.isMetaMask,
      isTrust: (provider as any).isTrust,
      isPhantom: (provider as any).isPhantom,
    });

    console.log('📞 [connectMetaMask] Requesting accounts...');

    let accounts;

    // If forceReconnect is true, request new permissions to force account selection
    if (forceReconnect) {
      console.log('🔄 [connectMetaMask] Force reconnect - requesting new permissions...');
      try {
        // Request new permissions - this will show the account selection dialog
        await provider.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permError: any) {
        // If user cancels, throw to handle below
        if (permError.code === 4001) {
          throw permError;
        }
        // If wallet_requestPermissions is not supported or fails, continue with eth_requestAccounts
        console.warn('⚠️ wallet_requestPermissions failed, falling back to eth_requestAccounts');
      }
    }

    // Request accounts
    accounts = await provider.request({
      method: 'eth_requestAccounts',
    });

    console.log('✅ [connectMetaMask] Accounts received:', accounts);

    if (!accounts || accounts.length === 0) {
      return {
        success: false,
        error: 'No accounts returned from MetaMask',
      };
    }

    // Get chain ID
    const chainId = await provider.request({ method: 'eth_chainId' });

    console.log('MetaMask connected:', {
      address: accounts[0],
      chainId: parseInt(chainId, 16),
    });

    return {
      success: true,
      address: accounts[0],
      chainId: parseInt(chainId, 16),
    };
  } catch (error: any) {
    console.error('MetaMask connection error:', error);

    // User rejected the request
    if (error.code === 4001) {
      return {
        success: false,
        error: 'Connection rejected by user',
      };
    }

    return {
      success: false,
      error: error.message || 'Failed to connect to MetaMask',
    };
  }
}

/**
 * Connect to WalletConnect
 * Note: This is a placeholder. Full implementation requires @walletconnect/web3-provider
 */
export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  try {
    console.log('WalletConnect integration coming soon...');

    // TODO: Implement WalletConnect
    // For now, return an error
    return {
      success: false,
      error: 'WalletConnect support coming soon',
    };

    /*
    // Future implementation:
    import WalletConnectProvider from "@walletconnect/web3-provider";

    const provider = new WalletConnectProvider({
      rpc: {
        11155420: "https://api.zan.top/opt-sepolia",
      },
    });

    await provider.enable();

    const accounts = await provider.request({ method: "eth_accounts" });
    const chainId = await provider.request({ method: "eth_chainId" });

    return {
      success: true,
      address: accounts[0],
      chainId: parseInt(chainId, 16),
    };
    */
  } catch (error: any) {
    console.error('WalletConnect connection error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to WalletConnect',
    };
  }
}

/**
 * Get the current provider (for reading operations)
 */
export function getCurrentProvider() {
  // Try to get MetaMask first
  const metamask = getMetaMaskProvider();
  if (metamask) {
    return metamask;
  }

  // Fallback to window.ethereum
  if (typeof window !== 'undefined' && window.ethereum) {
    return window.ethereum;
  }

  return null;
}

/**
 * Switch to the correct network
 */
export async function switchToNetwork(_chainId: number, chainIdHex: string, networkConfig: any): Promise<boolean> {
  const provider = getCurrentProvider();

  if (!provider) {
    return false;
  }

  try {
    // Try to switch to the network
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to the wallet
    if (switchError.code === 4902) {
      try {
        // Try to add the network
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [networkConfig],
        });
        return true;
      } catch (addError) {
        console.error('Failed to add network:', addError);
        return false;
      }
    }
    console.error('Failed to switch network:', switchError);
    return false;
  }
}
