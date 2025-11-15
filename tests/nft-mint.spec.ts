import { test, expect } from '@playwright/test';

test.describe('NFT Mint Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup API mocking
    await context.route('**/api/nft/info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        }),
      });
    });

    await context.route('**/api/nft/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: {
            totalMinted: 1766,
            remainingSupply: 8234,
            totalFundsRaised: '0.1766',
            remainingFunds: '0.8234',
            lastMintTime: new Date().toISOString(),
          },
        }),
      });
    });

    await context.route('**/api/nft/mint-record', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Record saved successfully',
          data: {
            recordId: `rec_${Date.now()}`,
          },
        }),
      });
    });

    await context.route('**/api/nft/user/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: [
            {
              tokenId: '1',
              name: 'Test NFT #1',
              image: 'https://via.placeholder.com/250',
              mintedAt: new Date().toISOString(),
              txHash: '0x1234567890123456789012345678901234567890123456789012345678901234',
            },
            {
              tokenId: '2',
              name: 'Test NFT #2',
              image: 'https://via.placeholder.com/250',
              mintedAt: new Date().toISOString(),
              txHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
            },
          ],
        }),
      });
    });

    await page.goto('/');
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('NFT Mint Test');
  });

  test('should display wallet connection section', async ({ page }) => {
    const walletSection = page.getByTestId('wallet-section');
    await expect(walletSection).toBeVisible();
  });

  test('should display NFT statistics', async ({ page }) => {
    // Wait for stats to load
    await page.waitForTimeout(1000);

    const totalSupply = page.getByTestId('total-supply');
    const remainingSupply = page.getByTestId('remaining-supply');
    const totalMinted = page.getByTestId('total-minted');
    const totalFunds = page.getByTestId('total-funds');

    await expect(totalSupply).toContainText('10,000');
    await expect(remainingSupply).toContainText('8,234');
    await expect(totalMinted).toContainText('1,766');
    await expect(totalFunds).toContainText('0.1766');
  });

  test('should show connected wallet address in test mode', async ({ page }) => {
    // In test mode, wallet should be auto-connected
    await page.waitForTimeout(500);

    const walletAddress = page.getByTestId('wallet-address');
    await expect(walletAddress).toBeVisible();
    await expect(walletAddress).toContainText('Connected:');
  });

  test('should enable mint button when wallet is connected', async ({ page }) => {
    await page.waitForTimeout(500);

    const mintBtn = page.getByTestId('mint-btn');
    await expect(mintBtn).toBeVisible();
    await expect(mintBtn).toBeEnabled();
    await expect(mintBtn).toContainText('Mint NFT');
  });

  test('should complete mint transaction successfully', async ({ page }) => {
    await page.waitForTimeout(500);

    const mintBtn = page.getByTestId('mint-btn');
    await mintBtn.click();

    // Wait for transaction to complete (mock delay is 2s)
    await page.waitForTimeout(3000);

    // Check for success message
    const txStatus = page.getByTestId('tx-status');
    await expect(txStatus).toBeVisible();
    await expect(txStatus).toContainText('Transaction successful');
    await expect(txStatus).toContainText('Hash:');
  });

  test('should disable mint button during transaction', async ({ page }) => {
    await page.waitForTimeout(500);

    const mintBtn = page.getByTestId('mint-btn');
    await mintBtn.click();

    // Button should be disabled immediately
    await expect(mintBtn).toBeDisabled();
    await expect(mintBtn).toContainText('Minting...');

    // Wait for transaction to complete
    await page.waitForTimeout(3000);

    // Button should be enabled again
    await expect(mintBtn).toBeEnabled();
  });

  test('should display proper button text for different states', async ({ page }) => {
    await page.waitForTimeout(500);

    const mintBtn = page.getByTestId('mint-btn');

    // Connected state
    await expect(mintBtn).toContainText('Mint NFT');
    await expect(mintBtn).toContainText('0.0001 ETH');
  });

  test('should show transaction hash link after successful mint', async ({ page }) => {
    await page.waitForTimeout(500);

    const mintBtn = page.getByTestId('mint-btn');
    await mintBtn.click();

    // Wait for transaction
    await page.waitForTimeout(3000);

    const txStatus = page.getByTestId('tx-status');
    const txText = await txStatus.textContent();

    // Verify transaction hash format (0x followed by 64 hex characters)
    expect(txText).toMatch(/0x[a-fA-F0-9]{64}/);
  });

  test('should update stats after successful mint', async ({ page }) => {
    await page.waitForTimeout(500);

    // Get initial stats
    const totalMintedBefore = await page.getByTestId('total-minted').textContent();

    // Mock updated stats after mint
    await page.context().route('**/api/nft/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: {
            totalMinted: 1767, // Increased by 1
            remainingSupply: 8233, // Decreased by 1
            totalFundsRaised: '0.1767',
            remainingFunds: '0.8233',
            lastMintTime: new Date().toISOString(),
          },
        }),
      });
    });

    // Perform mint
    const mintBtn = page.getByTestId('mint-btn');
    await mintBtn.click();

    // Wait for transaction and stats refresh
    await page.waitForTimeout(4000);

    // Check updated stats
    const totalMintedAfter = await page.getByTestId('total-minted').textContent();
    expect(totalMintedAfter).not.toBe(totalMintedBefore);
  });

  test('should handle sold out state', async ({ page }) => {
    // Mock sold out stats
    await page.context().route('**/api/nft/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: {
            totalMinted: 10000,
            remainingSupply: 0,
            totalFundsRaised: '1.0000',
            remainingFunds: '0.0000',
            lastMintTime: new Date().toISOString(),
          },
        }),
      });
    });

    await page.reload();
    await page.waitForTimeout(1000);

    const mintBtn = page.getByTestId('mint-btn');
    await expect(mintBtn).toBeDisabled();
    await expect(mintBtn).toContainText('Sold Out');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.waitForTimeout(500);

    // All elements should still be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('wallet-section')).toBeVisible();
    await expect(page.getByTestId('stats-section')).toBeVisible();
    await expect(page.getByTestId('mint-btn')).toBeVisible();
  });

  test('should display user NFTs when wallet is connected', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Should show user NFTs section
    const nftsSection = page.getByTestId('user-nfts-section');
    await expect(nftsSection).toBeVisible();

    // Should show NFT count in title
    const sectionTitle = nftsSection.locator('.section-title');
    await expect(sectionTitle).toContainText('My NFTs (2)');

    // Should display NFT cards
    const nftCards = page.getByTestId('nft-card');
    await expect(nftCards).toHaveCount(2);
  });
});

test.describe('Wallet Connection', () => {
  test('should disconnect wallet successfully', async ({ page, context }) => {
    // Setup mocks for NFT info
    await context.route('**/api/nft/info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
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
        }),
      });
    });

    await context.route('**/api/nft/stats', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: {
            totalMinted: 1766,
            remainingSupply: 8234,
            totalFundsRaised: '0.1766',
            remainingFunds: '0.8234',
            lastMintTime: new Date().toISOString(),
          },
        }),
      });
    });

    await context.route('**/api/nft/mint-record', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'Record saved successfully',
          data: {
            recordId: `rec_${Date.now()}`,
          },
        }),
      });
    });

    await context.route('**/api/nft/user/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          message: 'success',
          data: [],
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(500);

    // Should be connected in test mode
    const walletAddress = page.getByTestId('wallet-address');
    await expect(walletAddress).toBeVisible();

    // Click disconnect
    const disconnectBtn = page.locator('button', { hasText: 'Disconnect' });
    await disconnectBtn.click();

    await page.waitForTimeout(500);

    // Should show connect button
    const connectBtn = page.getByTestId('connect-wallet-btn');
    await expect(connectBtn).toBeVisible();
    await expect(walletAddress).not.toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle API errors gracefully', async ({ page, context }) => {
    // Mock API error
    await context.route('**/api/nft/info', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Internal Server Error',
        }),
      });
    });

    await context.route('**/api/nft/stats', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 500,
          message: 'Internal Server Error',
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Stats should show placeholder values
    const totalSupply = page.getByTestId('total-supply');
    await expect(totalSupply).toContainText('-');
  });
});
