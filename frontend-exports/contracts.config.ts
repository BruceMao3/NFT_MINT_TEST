/**
 * Explorer Protocol - Frontend Configuration (TypeScript)
 * OP Sepolia Testnet Deployment
 */

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155420, // 0xaa37dc in hex
  chainIdHex: '0xaa37dc' as const,
  chainName: 'OP Sepolia',
  rpcUrl: 'https://api.zan.top/opt-sepolia',
  publicRpcUrl: 'https://sepolia.optimism.io', // Public RPC (fallback)
  blockExplorer: 'https://sepolia-optimism.etherscan.io',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
} as const;

// Contract Addresses (Use Proxy addresses for all interactions)
export const CONTRACT_ADDRESSES = {
  // Main contracts (Frontend should interact with these Proxy addresses)
  ExplorerToken: '0x7528A496E0C212fcA3263D272a04309a2330FfC6' as `0x${string}`,
  Minter: '0x26F87856E62f2F72feD55938972684c2C1eFDcC9' as `0x${string}`,
  Treasury: '0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233' as `0x${string}`,

  // Implementation contracts (For reference only, do not use directly)
  ExplorerTokenImpl: '0xb5d44001E75267bd545596C2BC74A38E2Aa5d5a1' as `0x${string}`,
  MinterImpl: '0x897c8b3FDA42d8793afA07791E7bEb2dACec1282' as `0x${string}`,
  TreasuryImpl: '0xA9dC025ED433925Ad8CB8F90D2fCcE9d5F263A97' as `0x${string}`
} as const;

// Token IDs
export const TOKEN_IDS = {
  POWER: 1,
  OIL: 2,
  EXPLORER: 3
} as const;

export type TokenId = typeof TOKEN_IDS[keyof typeof TOKEN_IDS];

// Token Configuration Interface
export interface TokenConfig {
  id: TokenId;
  name: string;
  symbol: string;
  priceWei: string;
  priceETH: string;
  maxSupply: number;
  walletCap: number;
  whitelistRequired: boolean;
  description: string;
}

// Token Configuration
export const TOKEN_CONFIG: Record<TokenId, TokenConfig> = {
  [TOKEN_IDS.POWER]: {
    id: TOKEN_IDS.POWER,
    name: 'POWER',
    symbol: 'POWER',
    priceWei: '100000000000', // 0.0000001 ETH in wei
    priceETH: '0.0000001',
    maxSupply: 3000,
    walletCap: 1000,
    whitelistRequired: false,
    description: 'Basic resource token'
  },
  [TOKEN_IDS.OIL]: {
    id: TOKEN_IDS.OIL,
    name: 'OIL',
    symbol: 'OIL',
    priceWei: '100000000000', // 0.0000001 ETH in wei
    priceETH: '0.0000001',
    maxSupply: 3000,
    walletCap: 1000,
    whitelistRequired: false,
    description: 'Basic resource token'
  },
  [TOKEN_IDS.EXPLORER]: {
    id: TOKEN_IDS.EXPLORER,
    name: 'EXPLORER',
    symbol: 'EXPLORER',
    priceWei: '100000000000', // 0.0000001 ETH in wei
    priceETH: '0.0000001',
    maxSupply: 1000,
    walletCap: 1000,
    whitelistRequired: true,
    description: 'Premium token (whitelist required)'
  }
};

// Helper function to get token info
export function getTokenInfo(tokenId: TokenId): TokenConfig {
  return TOKEN_CONFIG[tokenId];
}

// Helper function to calculate purchase cost in wei
export function calculateCost(tokenId: TokenId, amount: number): string {
  const tokenInfo = TOKEN_CONFIG[tokenId];
  if (!tokenInfo) throw new Error('Invalid token ID');

  const priceWei = BigInt(tokenInfo.priceWei);
  const totalCost = priceWei * BigInt(amount);

  return totalCost.toString();
}

// Helper function to format wei to ETH
export function weiToETH(wei: string | bigint): string {
  const weiValue = typeof wei === 'string' ? BigInt(wei) : wei;
  return (Number(weiValue) / 1e18).toFixed(10);
}

// Helper function to get block explorer URLs
export function getExplorerUrls(
  addressOrHash: string,
  type: 'address' | 'tx' | 'token' | 'block' = 'address'
): string {
  const base = NETWORK_CONFIG.blockExplorer;
  return `${base}/${type}/${addressOrHash}`;
}

// Error messages mapping
export const ERROR_MESSAGES: Record<string, string> = {
  'SaleClosed': 'Sale is not active',
  'WrongTokenId': 'Invalid token ID',
  'WrongETH': 'Incorrect payment amount',
  'NotWhitelisted': 'Address is not whitelisted (required for EXPLORER token)',
  'WalletCapExceeded': 'Wallet holding cap exceeded (max 1000 per token)',
  'MaxSupplyExceeded': 'Maximum supply exceeded',
  'InsufficientBalance': 'Insufficient balance to complete purchase',
  'insufficient funds': 'Insufficient ETH balance',
  'user rejected': 'Transaction rejected by user',
  'ERC1155': 'Token transfer failed'
};

// Helper function to parse contract errors
export function parseContractError(error: any): string {
  const errorMessage = error?.message || error?.toString() || '';

  // Check for known error messages
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key)) {
      return message;
    }
  }

  // Return generic message if no match found
  return 'Transaction failed. Please try again.';
}
