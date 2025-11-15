import type { SdkConfig, SdkResult, TxResult } from './types';
import { ERROR_CODES, TxStatus } from './types';
import { getWalletState } from './wallet';
import { recordMintTransaction } from './api';

let config: SdkConfig | null = null;

export function initContract(sdkConfig: SdkConfig) {
  config = sdkConfig;
}

// Mint NFT
export async function mint(mintPrice: string): Promise<SdkResult<TxResult>> {
  if (!config) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: 'SDK not initialized',
    };
  }

  const walletState = getWalletState();

  if (!walletState.connected || !walletState.address) {
    return {
      ok: false,
      code: ERROR_CODES.WALLET_NOT_CONNECTED,
      message: 'Wallet not connected',
    };
  }

  // Test mode: mock mint transaction
  if (config.testMode) {
    // Generate a proper 64-character hex string (32 bytes)
    const mockTxHash = `0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`;

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const txResult: TxResult = {
      txHash: mockTxHash,
      status: TxStatus.SUCCESS,
      blockNumber: Math.floor(Math.random() * 1000000),
    };

    // Record mint transaction
    await recordMintTransaction({
      walletAddress: walletState.address,
      txHash: mockTxHash,
      amount: mintPrice,
      timestamp: new Date().toISOString(),
    });

    return { ok: true, data: txResult };
  }

  // Production mode: real contract interaction
  try {
    if (!window.ethereum) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'No wallet provider found',
      };
    }

    if (!config.contractAddress) {
      return {
        ok: false,
        code: ERROR_CODES.CONTRACT_ERROR,
        message: 'Contract address not configured',
      };
    }

    // Convert mintPrice (ETH) to Wei
    const priceInWei = BigInt(Math.floor(parseFloat(mintPrice) * 1e18));

    // Prepare transaction
    const transactionParameters = {
      to: config.contractAddress,
      from: walletState.address,
      value: `0x${priceInWei.toString(16)}`,
      data: '0x1249c58b', // mint() function signature
    };

    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    // Wait for transaction confirmation
    const receipt = await waitForTransaction(txHash);

    if (receipt.status === TxStatus.SUCCESS) {
      // Record mint transaction
      await recordMintTransaction({
        walletAddress: walletState.address,
        txHash,
        amount: mintPrice,
        timestamp: new Date().toISOString(),
      });
    }

    return { ok: true, data: receipt };
  } catch (error: any) {
    // Handle specific errors
    if (error.code === 4001) {
      return {
        ok: false,
        code: ERROR_CODES.USER_REJECTED,
        message: 'User rejected the transaction',
      };
    }

    if (error.message?.includes('insufficient funds')) {
      return {
        ok: false,
        code: ERROR_CODES.INSUFFICIENT_FUNDS,
        message: 'Insufficient funds for transaction',
      };
    }

    return {
      ok: false,
      code: ERROR_CODES.CONTRACT_ERROR,
      message: error.message || 'Transaction failed',
      detail: error,
    };
  }
}

// Wait for transaction confirmation
async function waitForTransaction(txHash: string): Promise<TxResult> {
  if (config?.testMode) {
    return {
      txHash,
      status: TxStatus.SUCCESS,
      blockNumber: 12345678,
    };
  }

  // Poll for transaction receipt
  let attempts = 0;
  const maxAttempts = 60; // 60 attempts * 2s = 2 minutes

  while (attempts < maxAttempts) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash],
      });

      if (receipt) {
        return {
          txHash,
          status: receipt.status === '0x1' ? TxStatus.SUCCESS : TxStatus.FAILED,
          blockNumber: parseInt(receipt.blockNumber, 16),
        };
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  return {
    txHash,
    status: TxStatus.FAILED,
    error: 'Transaction confirmation timeout',
  };
}

// Get transaction status
export async function getTxStatus(txHash: string): Promise<SdkResult<TxResult>> {
  try {
    const receipt = await waitForTransaction(txHash);
    return { ok: true, data: receipt };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.UNKNOWN_ERROR,
      message: error.message || 'Failed to get transaction status',
      detail: error,
    };
  }
}
