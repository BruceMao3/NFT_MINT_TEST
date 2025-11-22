// Dashboard API Service for Explorer Protocol
// API Endpoint: https://explorer-service.vercel.app

const API_BASE_URL = 'https://explorer-service.vercel.app/api';
const API_KEY = 'demo-key-change-me';

export interface TokenSupply {
  id: string;
  totalSupply: string;
  maxSupply: string;
  walletCap: string;
  vestingTime: string;
  isVested: boolean;
  uri: string;
}

export interface DashboardOverview {
  chainId: string;
  chainName: string;
  blockNumber: number;
  blockTimestamp: number;
  token: {
    address: string;
    paused: boolean;
    minterHasRole: boolean;
    supply: TokenSupply[];
  };
  minter: {
    address: string;
    paused: boolean;
    saleActive: boolean;
    tokenAddress: string;
    treasuryAddress: string;
    usdt: string;
    usdc: string;
    profitSharingContract: string;
    uniqueBuyerCount: string;
    prices: any[];
    dependencies: any[];
  };
  treasury: {
    address: string;
    paused: boolean;
    balanceETH: string;
    balanceUSDT: string;
    balanceUSDC: string;
    usdt: string;
    usdc: string;
  };
  connections: {
    minterHasRole: boolean;
    tokenMatch: boolean;
    treasuryMatch: boolean;
  };
}

export interface NFTStats {
  tokenId: string;
  name: string;
  minted: number;
  remaining: number;
  maxSupply: number;
  progress: number;
  vestingTime: number;
  isVested: boolean;
}

export interface OverallStats {
  totalRaisedETH: number;
  totalRaisedUSDT: number;
  totalRaisedUSDC: number;
  uniqueBuyerCount: number;
  nftStats: NFTStats[];
}

// Health check
export async function checkHealth(): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return { ok: false, error: 'Health check failed' };
    }
    const data = await response.json();
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message };
  }
}

// Get dashboard overview
export async function getDashboardOverview(
  chainId: number
): Promise<{ ok: boolean; data?: DashboardOverview; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/dashboard/overview?chainId=${chainId}`, {
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorText = `HTTP ${response.status}`;
      try {
        const errorData = await response.text();
        if (errorData) errorText += `: ${errorData}`;
      } catch (e) {
        // Ignore parse error
      }
      return { ok: false, error: errorText };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { ok: false, error: 'Request timeout - API is taking too long to respond' };
    }
    return { ok: false, error: error.message || 'Network error' };
  }
}

// Parse dashboard data for UI display
export function parseOverviewStats(overview: DashboardOverview): OverallStats {
  const TOKEN_NAMES: { [key: string]: string } = {
    '1': 'POWER',
    '2': 'OIL',
    '3': 'EXPLORER',
  };

  // Calculate NFT stats - filter out tokens with maxSupply = 0
  const nftStats: NFTStats[] = overview.token.supply
    .filter((supply) => parseInt(supply.maxSupply) > 0)
    .map((supply) => {
      const minted = parseInt(supply.totalSupply);
      const maxSupply = parseInt(supply.maxSupply);
      const remaining = maxSupply - minted;
      const progress = maxSupply > 0 ? (minted / maxSupply) * 100 : 0;
      const vestingTime = parseInt(supply.vestingTime);

      return {
        tokenId: supply.id,
        name: TOKEN_NAMES[supply.id] || `Token #${supply.id}`,
        minted,
        remaining,
        maxSupply,
        progress,
        vestingTime,
        isVested: supply.isVested,
      };
    });

  // Convert treasury balances
  // ETH: from Wei (10^18) to ETH
  const totalRaisedETH = Number(BigInt(overview.treasury.balanceETH || '0')) / 1e18;
  // USDT/USDC: from smallest unit (10^6) to human readable
  const totalRaisedUSDT = Number(BigInt(overview.treasury.balanceUSDT || '0')) / 1e6;
  const totalRaisedUSDC = Number(BigInt(overview.treasury.balanceUSDC || '0')) / 1e6;

  // Get unique buyer count from minter (excluding airdrops, only paid participants)
  const uniqueBuyerCount = parseInt(overview.minter.uniqueBuyerCount || '0');

  return {
    totalRaisedETH,
    totalRaisedUSDT,
    totalRaisedUSDC,
    uniqueBuyerCount,
    nftStats,
  };
}

// Calculate time remaining for vesting
export function getVestingTimeRemaining(vestingTimestamp: number): {
  isVested: boolean;
  timeRemaining: string;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = Math.floor(Date.now() / 1000);
  const diff = vestingTimestamp - now;

  if (diff <= 0) {
    return {
      isVested: true,
      timeRemaining: 'Vested',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return {
    isVested: false,
    timeRemaining: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    days,
    hours,
    minutes,
    seconds,
  };
}

