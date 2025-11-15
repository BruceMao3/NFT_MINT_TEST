import type { SdkConfig, SdkResult, WalletState, NftContractInfo, NftStats, TxResult, UserNft } from './types';
import { initApi, getNftInfo as apiGetNftInfo, getNftStats as apiGetNftStats, getUserNfts as apiGetUserNfts } from './api';
import {
  initWallet,
  connectWallet as walletConnect,
  disconnectWallet as walletDisconnect,
  switchNetwork as walletSwitchNetwork,
  getWalletState,
  updateWalletState,
  onWalletStateChange,
} from './wallet';
import { initContract, mint as contractMint, getTxStatus as contractGetTxStatus } from './contract';

// Export types
export * from './types';

// SDK Instance
class NftMintSDK {
  private initialized = false;
  private config: SdkConfig | null = null;

  // Initialize SDK
  init(config: SdkConfig): void {
    this.config = config;
    this.initialized = true;

    // Initialize modules
    initApi(config.apiBaseUrl);
    initWallet(config);
    initContract(config);

    console.log('[NFT Mint SDK] Initialized with config:', {
      chainId: config.chainId,
      testMode: config.testMode,
    });
  }

  // Check if SDK is initialized
  private ensureInitialized(): boolean {
    if (!this.initialized || !this.config) {
      console.error('[NFT Mint SDK] SDK not initialized. Call init() first.');
      return false;
    }
    return true;
  }

  // Get current configuration
  getConfig(): SdkConfig | null {
    return this.config;
  }

  // Wallet Methods
  async connectWallet(): Promise<SdkResult<WalletState>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return walletConnect();
  }

  async disconnectWallet(): Promise<SdkResult<void>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return walletDisconnect();
  }

  async switchNetwork(chainId: number): Promise<SdkResult<void>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return walletSwitchNetwork(chainId);
  }

  getWalletState(): WalletState {
    return getWalletState();
  }

  updateWalletState(newState: WalletState): void {
    updateWalletState(newState);
  }

  onWalletStateChange(listener: (state: WalletState) => void): () => void {
    return onWalletStateChange(listener);
  }

  // NFT Info Methods
  async getNftInfo(): Promise<SdkResult<NftContractInfo>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return apiGetNftInfo();
  }

  async getNftStats(): Promise<SdkResult<NftStats>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return apiGetNftStats();
  }

  async getUserNfts(walletAddress: string): Promise<SdkResult<UserNft[]>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return apiGetUserNfts(walletAddress);
  }

  // Mint Methods
  async mint(mintPrice: string): Promise<SdkResult<TxResult>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return contractMint(mintPrice);
  }

  async getTxStatus(txHash: string): Promise<SdkResult<TxResult>> {
    if (!this.ensureInitialized()) {
      return {
        ok: false,
        code: 'SDK_NOT_INITIALIZED',
        message: 'SDK not initialized',
      };
    }
    return contractGetTxStatus(txHash);
  }
}

// Export singleton instance
export const sdk = new NftMintSDK();

// Export wallet state update function for direct use
export { updateWalletState } from './wallet';

// Default export
export default sdk;
