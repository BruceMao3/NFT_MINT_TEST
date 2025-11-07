import { http, HttpResponse } from '@playwright/test';

// Mock NFT data
let mockStats = {
  totalMinted: 1766,
  remainingSupply: 8234,
  totalFundsRaised: '0.1766',
  remainingFunds: '0.8234',
  lastMintTime: new Date().toISOString(),
};

export const handlers = [
  // Get NFT Info
  http.get('*/api/nft/info', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        contractAddress: '0x1234567890123456789012345678901234567890',
        totalSupply: 10000,
        mintPrice: '0.0001',
        maxSupply: 10000,
        name: 'Test NFT Collection',
        symbol: 'TNFT',
      },
    });
  }),

  // Get NFT Stats
  http.get('*/api/nft/stats', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockStats,
    });
  }),

  // Record Mint Transaction
  http.post('*/api/nft/mint-record', async ({ request }) => {
    const body = await request.json() as any;

    // Update mock stats after mint
    mockStats.totalMinted += 1;
    mockStats.remainingSupply -= 1;
    mockStats.totalFundsRaised = (
      parseFloat(mockStats.totalFundsRaised) + parseFloat(body.amount)
    ).toFixed(4);
    mockStats.lastMintTime = body.timestamp;

    return HttpResponse.json({
      code: 200,
      message: 'Record saved successfully',
      data: {
        recordId: `rec_${Date.now()}`,
      },
    });
  }),
];

// Reset mock data (useful for tests)
export function resetMockData() {
  mockStats = {
    totalMinted: 1766,
    remainingSupply: 8234,
    totalFundsRaised: '0.1766',
    remainingFunds: '0.8234',
    lastMintTime: new Date().toISOString(),
  };
}
