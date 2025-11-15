import type { SdkConfig, SdkResult, WalletState } from './types';
import { ERROR_CODES } from './types';

let config: SdkConfig | null = null;
let walletState: WalletState = { connected: false };

// State change listeners
const listeners: Array<(state: WalletState) => void> = [];

export function initWallet(sdkConfig: SdkConfig) {
  config = sdkConfig;

  // In test mode, automatically set connected state
  if (config.testMode && config.mockWalletAddress) {
    walletState = {
      connected: true,
      address: config.mockWalletAddress,
      chainId: config.chainId,
    };
    notifyListeners();
  }
}

export function onWalletStateChange(listener: (state: WalletState) => void) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

function notifyListeners() {
  listeners.forEach(listener => listener(walletState));
}

export function getWalletState(): WalletState {
  return { ...walletState };
}

/**
 * Update wallet state (for external wallet connections)
 * This allows App.tsx to update the SDK wallet state when using custom wallet connection
 */
export function updateWalletState(newState: WalletState): void {
  walletState = { ...newState };
  notifyListeners();
}

export async function connectWallet(): Promise<SdkResult<WalletState>> {
  if (!config) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'SDK not initialized',
    };
  }

  // Test mode: mock wallet connection
  if (config.testMode) {
    walletState = {
      connected: true,
      address: config.mockWalletAddress || '0x0000000000000000000000000000000000000000',
      chainId: config.chainId,
    };
    notifyListeners();
    return { ok: true, data: walletState };
  }

  // Production mode: real wallet connection
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'MetaMask not installed',
      };
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    if (!accounts || accounts.length === 0) {
      return {
        ok: false,
        code: ERROR_CODES.USER_REJECTED,
        message: 'User rejected wallet connection',
      };
    }

    // Get current chain ID
    const chainId = await window.ethereum.request({
      method: 'eth_chainId',
    });

    const currentChainId = parseInt(chainId, 16);

    // Check if on correct network
    if (currentChainId !== config.chainId) {
      return {
        ok: false,
        code: ERROR_CODES.WRONG_NETWORK,
        message: `Please switch to chain ID ${config.chainId}`,
        detail: { currentChainId, expectedChainId: config.chainId },
      };
    }

    walletState = {
      connected: true,
      address: accounts[0],
      chainId: currentChainId,
    };

    notifyListeners();
    return { ok: true, data: walletState };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || 'Failed to connect wallet',
      detail: error,
    };
  }
}

export async function disconnectWallet(): Promise<SdkResult<void>> {
  walletState = { connected: false };
  notifyListeners();
  return { ok: true, data: undefined };
}

export async function switchNetwork(chainId: number): Promise<SdkResult<void>> {
  if (!config || config.testMode) {
    return { ok: true, data: undefined };
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    walletState.chainId = chainId;
    notifyListeners();
    return { ok: true, data: undefined };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || 'Failed to switch network',
      detail: error,
    };
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
