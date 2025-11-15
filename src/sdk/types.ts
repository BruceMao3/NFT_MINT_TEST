// SDK Result type for unified response handling
export type SdkResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; detail?: any };

// Configuration interface
export interface SdkConfig {
  apiBaseUrl: string;
  chainId: number;
  contractAddress?: string;
  rpcUrl?: string;
  walletConnectProjectId?: string;
  testMode?: boolean;
  mockWalletAddress?: string;
}

// NFT Contract Info
export interface NftContractInfo {
  contractAddress: string;
  totalSupply: number;
  mintPrice: string;
  maxSupply: number;
  name: string;
  symbol: string;
}

// NFT Statistics
export interface NftStats {
  totalMinted: number;
  remainingSupply: number;
  totalFundsRaised: string;
  remainingFunds: string;
  lastMintTime: string;
}

// Wallet Connection State
export interface WalletState {
  connected: boolean;
  address?: string;
  chainId?: number;
}

// Transaction Status
export enum TxStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// Transaction Result
export interface TxResult {
  txHash: string;
  status: TxStatus;
  blockNumber?: number;
  error?: string;
}

// Mint Record Request
export interface MintRecordRequest {
  walletAddress: string;
  txHash: string;
  amount: string;
  timestamp: string;
}

// User NFT
export interface UserNft {
  tokenId: string;
  name: string;
  image?: string;
  mintedAt: string;
  txHash: string;
}

// Error Codes
export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  API_ERROR: 'API_ERROR',
  SOLD_OUT: 'SOLD_OUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;
