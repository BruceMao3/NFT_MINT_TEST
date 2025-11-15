/**
 * Explorer Protocol - Frontend Configuration
 * OP Sepolia Testnet Deployment
 */

// Network Configuration
export const NETWORK_CONFIG = {
  chainId: 11155420, // 0xaa37dc in hex
  chainIdHex: '0xaa37dc',
  chainName: 'OP Sepolia',
  rpcUrl: 'https://api.zan.top/opt-sepolia',
  publicRpcUrl: 'https://sepolia.optimism.io', // Public RPC (fallback)
  blockExplorer: 'https://sepolia-optimism.etherscan.io',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  }
};

// Contract Addresses (Use Proxy addresses for all interactions)
export const CONTRACT_ADDRESSES = {
  // Main contracts (Frontend should interact with these Proxy addresses)
  ExplorerToken: '0x7528A496E0C212fcA3263D272a04309a2330FfC6',
  Minter: '0x26F87856E62f2F72feD55938972684c2C1eFDcC9',
  Treasury: '0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233',

  // Implementation contracts (For reference only, do not use directly)
  ExplorerTokenImpl: '0xb5d44001E75267bd545596C2BC74A38E2Aa5d5a1',
  MinterImpl: '0x897c8b3FDA42d8793afA07791E7bEb2dACec1282',
  TreasuryImpl: '0xA9dC025ED433925Ad8CB8F90D2fCcE9d5F263A97'
};

// Token Configuration
export const TOKEN_IDS = {
  POWER: 1,
  OIL: 2,
  EXPLORER: 3
};

export const TOKEN_CONFIG = {
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
export function getTokenInfo(tokenId) {
  return TOKEN_CONFIG[tokenId];
}

// Helper function to calculate purchase cost in wei
export function calculateCost(tokenId, amount) {
  const tokenInfo = TOKEN_CONFIG[tokenId];
  if (!tokenInfo) throw new Error('Invalid token ID');

  const priceWei = BigInt(tokenInfo.priceWei);
  const totalCost = priceWei * BigInt(amount);

  return totalCost.toString();
}

// Helper function to format wei to ETH
export function weiToETH(wei) {
  return (Number(wei) / 1e18).toFixed(10);
}

// Helper function to get block explorer URLs
export function getExplorerUrls(addressOrHash, type = 'address') {
  const base = NETWORK_CONFIG.blockExplorer;
  const routes = {
    address: 'address',
    tx: 'tx',
    token: 'token',
    block: 'block'
  };

  return `${base}/${routes[type]}/${addressOrHash}`;
}

// Error messages mapping
export const ERROR_MESSAGES = {
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
export function parseContractError(error) {
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

// Export all in one object for convenience
export default {
  NETWORK_CONFIG,
  CONTRACT_ADDRESSES,
  TOKEN_IDS,
  TOKEN_CONFIG,
  ERROR_MESSAGES,
  getTokenInfo,
  calculateCost,
  weiToETH,
  getExplorerUrls,
  parseContractError
};
