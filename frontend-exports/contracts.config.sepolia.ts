/**
 * Explorer Protocol - Frontend Configuration (TypeScript)
 * ETH Sepolia Testnet Deployment - LATEST VERSION
 *
 * Last Updated: 2025-11-16
 * Network: Ethereum Sepolia
 */

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155111, // 0xaa36a7 in hex
  chainIdHex: '0xaa36a7' as const,
  chainName: 'Sepolia',
  rpcUrl: 'https://0xrpc.io/sep',
  publicRpcUrl: 'https://rpc.sepolia.org', // Public RPC (fallback)
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
} as const;

// Contract Addresses (Use Proxy addresses for all interactions)
export const CONTRACT_ADDRESSES = {
  // Main contracts (Frontend should interact with these Proxy addresses)
  Treasury: '0xdfE0D74197336f824dE4fca2aff2837588E08A99' as `0x${string}`,
  ExplorerToken: '0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50' as `0x${string}`,
  Minter: '0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9' as `0x${string}`,

  // Implementation contracts (For reference only, do not use directly)
  TreasuryImpl: '0x56eC12c82Aae1e0800e7917D6598BCC709526bC0' as `0x${string}`,
  ExplorerTokenImpl: '0xbD6c5BbDb7DD35C3CEaFE9a14527B43A5F17B2cE' as `0x${string}`,
  MinterImpl: '0xdb2B5ED9dE94B481ADbdA731FB4F81eb5063Da9D' as `0x${string}`
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
  hasVesting: boolean;
  hasDependency: boolean;
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
    hasVesting: false,
    hasDependency: false,
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
    hasVesting: false,
    hasDependency: false,
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
    hasVesting: false,
    hasDependency: true, // May require POWER token (check with getDependency)
    description: 'Premium token (whitelist required, may have dependencies)'
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

// Error messages mapping (includes new vesting and dependency errors)
export const ERROR_MESSAGES: Record<string, string> = {
  'SaleClosed': 'Sale is not active',
  'WrongTokenId': 'Invalid token ID',
  'WrongETH': 'Incorrect payment amount',
  'NotWhitelisted': 'Address is not whitelisted (required for EXPLORER token)',
  'WalletCapExceeded': 'Wallet holding cap exceeded (max 1000 per token)',
  'SupplyExceeded': 'Maximum supply exceeded',
  'DependencyUnmet': 'Token dependency not met - you need to hold the prerequisite token first',
  'TokenVested': 'Token is currently locked (vesting period active)',
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

// New helper functions for vesting and dependencies

/**
 * Check if a token is currently vested (locked)
 * @param tokenContract - ExplorerToken contract instance
 * @param tokenId - Token ID to check
 * @returns Promise<boolean> - true if token is locked
 */
export async function checkIfVested(tokenContract: any, tokenId: TokenId): Promise<boolean> {
  try {
    return await tokenContract.isVested(tokenId);
  } catch (error) {
    console.error('Error checking vesting status:', error);
    return false;
  }
}

/**
 * Get vesting time for a token
 * @param tokenContract - ExplorerToken contract instance
 * @param tokenId - Token ID to check
 * @returns Promise<bigint> - Unix timestamp of vesting unlock time (0 if no vesting)
 */
export async function getVestingTime(tokenContract: any, tokenId: TokenId): Promise<bigint> {
  try {
    return await tokenContract.vestingTime(tokenId);
  } catch (error) {
    console.error('Error getting vesting time:', error);
    return 0n;
  }
}

/**
 * Get token dependency information
 * @param minterContract - Minter contract instance
 * @param tokenId - Token ID to check
 * @returns Promise<{prereqId: bigint, minBalance: bigint}>
 */
export async function getTokenDependency(minterContract: any, tokenId: TokenId): Promise<{prereqId: bigint, minBalance: bigint}> {
  try {
    return await minterContract.getDependency(tokenId);
  } catch (error) {
    console.error('Error getting dependency:', error);
    return { prereqId: 0n, minBalance: 0n };
  }
}

/**
 * Check if an address is in the dependency whitelist for a token
 * @param minterContract - Minter contract instance
 * @param tokenId - Token ID to check
 * @param address - User address to check
 * @returns Promise<boolean> - true if user can bypass dependency
 */
export async function isDependencyWhitelisted(minterContract: any, tokenId: TokenId, address: string): Promise<boolean> {
  try {
    return await minterContract.isDependencyWhitelisted(tokenId, address);
  } catch (error) {
    console.error('Error checking dependency whitelist:', error);
    return false;
  }
}
