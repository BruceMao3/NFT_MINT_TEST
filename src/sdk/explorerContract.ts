import type { SdkResult, TxResult } from './types';
import { ERROR_CODES, TxStatus } from './types';
import { getWalletState } from './wallet';
import { CONTRACT_ADDRESSES, TOKEN_IDS, calculateCost, parseContractError, NETWORK_CONFIG, type TokenId } from '../contracts/config';
import { encodeFunctionData, parseAbi } from 'viem';
import MinterABI from '../contracts/Minter.abi.json';
import ExplorerTokenABI from '../contracts/ExplorerToken.abi.json';

// Helper function to get the preferred Ethereum provider
function getEthereumProvider() {
  if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
    return null;
  }

  // If window.ethereum.providers exists, find MetaMask
  if (window.ethereum.providers?.length) {
    const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask);
    return metamask || window.ethereum.providers[0];
  }

  // Otherwise use window.ethereum directly
  return window.ethereum;
}

// Buy tokens from the Minter contract
export async function buyToken(
  tokenId: TokenId,
  amount: number
): Promise<SdkResult<TxResult>> {
  const walletState = getWalletState();

  if (!walletState.connected || !walletState.address) {
    return {
      ok: false,
      code: ERROR_CODES.WALLET_NOT_CONNECTED,
      message: 'Wallet not connected',
    };
  }

  try {
    const provider = getEthereumProvider();

    if (!provider) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'No wallet provider found',
      };
    }

    console.log('Buy token - provider found, checking network...');

    // Check if on correct network
    const chainId = await provider.request({ method: 'eth_chainId' });
    const currentChainId = parseInt(chainId, 16);

    console.log('Current chain:', currentChainId, 'Expected:', NETWORK_CONFIG.chainId);

    if (currentChainId !== NETWORK_CONFIG.chainId) {
      return {
        ok: false,
        code: ERROR_CODES.WRONG_NETWORK,
        message: `Please switch to ${NETWORK_CONFIG.chainName} (Chain ID: ${NETWORK_CONFIG.chainId})`,
      };
    }

    // Calculate cost in wei
    const costWei = calculateCost(tokenId, amount);
    console.log('Cost calculated:', costWei, 'wei');

    // Encode the buy function call
    // buy(uint256 id, uint256 amount, address to)
    const data = encodeFunctionData({
      abi: MinterABI,
      functionName: 'buy',
      args: [BigInt(tokenId), BigInt(amount), walletState.address as `0x${string}`],
    });

    console.log('Transaction data encoded');
    console.log('Minter contract:', CONTRACT_ADDRESSES.Minter);
    console.log('From:', walletState.address);
    console.log('Value:', costWei);

    // Prepare transaction
    const transactionParameters = {
      to: CONTRACT_ADDRESSES.Minter,
      from: walletState.address,
      value: `0x${BigInt(costWei).toString(16)}`,
      data: data,
    };

    console.log('Sending transaction...');

    // Send transaction
    const txHash = await provider.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters],
    });

    console.log('Transaction sent:', txHash);

    // Wait for transaction confirmation
    const receipt = await waitForTransaction(txHash);

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

    const parsedError = parseContractError(error);

    return {
      ok: false,
      code: ERROR_CODES.CONTRACT_ERROR,
      message: parsedError,
      detail: error,
    };
  }
}

// Get token balance for a user
export async function getTokenBalance(
  address: string,
  tokenId: TokenId
): Promise<SdkResult<number>> {
  try {
    const provider = getEthereumProvider();

    if (!provider) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'No wallet provider found',
      };
    }

    // Encode the balanceOf function call
    // balanceOf(address account, uint256 id)
    const data = encodeFunctionData({
      abi: ExplorerTokenABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`, BigInt(tokenId)],
    });

    const result = await provider.request({
      method: 'eth_call',
      params: [
        {
          to: CONTRACT_ADDRESSES.ExplorerToken,
          data: data,
        },
        'latest',
      ],
    });

    const balance = parseInt(result, 16);
    return { ok: true, data: balance };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.CONTRACT_ERROR,
      message: error.message || 'Failed to get token balance',
      detail: error,
    };
  }
}

// Check if address is whitelisted
export async function checkWhitelist(address: string): Promise<SdkResult<boolean>> {
  try {
    const provider = getEthereumProvider();

    if (!provider) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'No wallet provider found',
      };
    }

    // Encode the isWhitelisted function call
    const data = encodeFunctionData({
      abi: MinterABI,
      functionName: 'isWhitelisted',
      args: [address as `0x${string}`],
    });

    const result = await provider.request({
      method: 'eth_call',
      params: [
        {
          to: CONTRACT_ADDRESSES.Minter,
          data: data,
        },
        'latest',
      ],
    });

    const isWhitelisted = result === '0x0000000000000000000000000000000000000000000000000000000000000001';
    return { ok: true, data: isWhitelisted };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.CONTRACT_ERROR,
      message: error.message || 'Failed to check whitelist status',
      detail: error,
    };
  }
}

// Check if sale is active
export async function checkSaleActive(): Promise<SdkResult<boolean>> {
  try {
    const provider = getEthereumProvider();

    if (!provider) {
      return {
        ok: false,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        message: 'No wallet provider found',
      };
    }

    // Encode the saleActive function call
    const data = encodeFunctionData({
      abi: MinterABI,
      functionName: 'saleActive',
      args: [],
    });

    const result = await provider.request({
      method: 'eth_call',
      params: [
        {
          to: CONTRACT_ADDRESSES.Minter,
          data: data,
        },
        'latest',
      ],
    });

    const isActive = result === '0x0000000000000000000000000000000000000000000000000000000000000001';
    return { ok: true, data: isActive };
  } catch (error: any) {
    return {
      ok: false,
      code: ERROR_CODES.CONTRACT_ERROR,
      message: error.message || 'Failed to check sale status',
      detail: error,
    };
  }
}

// Wait for transaction confirmation
async function waitForTransaction(txHash: string): Promise<TxResult> {
  const provider = getEthereumProvider();

  if (!provider) {
    return {
      txHash,
      status: TxStatus.FAILED,
      error: 'Provider not available',
    };
  }

  // Poll for transaction receipt
  let attempts = 0;
  const maxAttempts = 60; // 60 attempts * 2s = 2 minutes

  while (attempts < maxAttempts) {
    try {
      const receipt = await provider.request({
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
