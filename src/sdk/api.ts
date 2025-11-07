import type { NftContractInfo, NftStats, MintRecordRequest, SdkResult } from './types';

let apiBaseUrl = '';

export function initApi(baseUrl: string) {
  apiBaseUrl = baseUrl;
}

// Get NFT Contract Info
export async function getNftInfo(): Promise<SdkResult<NftContractInfo>> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/nft/info`);
    const result = await response.json();

    if (result.code === 200) {
      return { ok: true, data: result.data };
    } else {
      return {
        ok: false,
        code: 'API_ERROR',
        message: result.message || 'Failed to fetch NFT info',
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      code: 'API_ERROR',
      message: error.message || 'Network error',
      detail: error,
    };
  }
}

// Get NFT Statistics
export async function getNftStats(): Promise<SdkResult<NftStats>> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/nft/stats`);
    const result = await response.json();

    if (result.code === 200) {
      return { ok: true, data: result.data };
    } else {
      return {
        ok: false,
        code: 'API_ERROR',
        message: result.message || 'Failed to fetch NFT stats',
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      code: 'API_ERROR',
      message: error.message || 'Network error',
      detail: error,
    };
  }
}

// Record Mint Transaction
export async function recordMintTransaction(
  request: MintRecordRequest
): Promise<SdkResult<{ recordId: string }>> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/nft/mint-record`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    const result = await response.json();

    if (result.code === 200) {
      return { ok: true, data: result.data };
    } else {
      return {
        ok: false,
        code: 'API_ERROR',
        message: result.message || 'Failed to record mint transaction',
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      code: 'API_ERROR',
      message: error.message || 'Network error',
      detail: error,
    };
  }
}
