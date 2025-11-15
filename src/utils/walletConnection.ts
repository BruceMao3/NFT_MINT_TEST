/**
 * Wallet Connection Utilities
 * Supports MetaMask and WalletConnect
 */

export type WalletType = 'metamask' | 'walletconnect';

export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  chainId?: number;
  error?: string;
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
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
 */
export function getMetaMaskProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error('❌ window.ethereum not found');
    return null;
  }

  console.log('🔍 Checking for MetaMask...');
  console.log('window.ethereum.isMetaMask:', window.ethereum.isMetaMask);
  console.log('window.ethereum.isTrust:', (window.ethereum as any).isTrust);
  console.log('window.ethereum.providers:', window.ethereum.providers);

  // If there are multiple providers, find MetaMask
  if (window.ethereum.providers?.length) {
    console.log('📦 Found multiple providers:', window.ethereum.providers.length);
    window.ethereum.providers.forEach((p: any, i: number) => {
      console.log(`  Provider ${i}:`, {
        isMetaMask: p.isMetaMask,
        isTrust: p.isTrust,
        isPhantom: p.isPhantom,
      });
    });

    const metamaskProvider = window.ethereum.providers.find((p: any) => p.isMetaMask);
    if (metamaskProvider) {
      console.log('✅ Found MetaMask in providers array');
      return metamaskProvider;
    } else {
      console.warn('⚠️ MetaMask not found in providers array');
      return null;
    }
  }

  // If it's MetaMask, return it
  if (window.ethereum.isMetaMask) {
    console.log('✅ window.ethereum is MetaMask');
    return window.ethereum;
  }

  console.error('❌ MetaMask not found');
  return null;
}

/**
 * Connect to MetaMask
 */
export async function connectMetaMask(): Promise<WalletConnectionResult> {
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

    // Request accounts
    const accounts = await provider.request({
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
export async function switchToNetwork(chainId: number, chainIdHex: string, networkConfig: any): Promise<boolean> {
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
