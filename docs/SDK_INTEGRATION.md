# NFT Mint SDK Integration Guide

This document provides detailed instructions for integrating the NFT Mint SDK into your frontend application.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Test Mode](#test-mode)
- [Best Practices](#best-practices)

## Overview

The NFT Mint SDK is a framework-agnostic JavaScript/TypeScript library that handles all blockchain interactions for NFT minting. It provides:

- Wallet connection (MetaMask, WalletConnect)
- Network detection and switching
- NFT contract interactions
- Transaction status tracking
- Backend API integration
- Comprehensive error handling

### Key Features

- **Zero Dependencies on UI Frameworks**: Works with React, Vue, Angular, vanilla JS, etc.
- **TypeScript Support**: Fully typed for better developer experience
- **Test Mode**: Built-in mock mode for development and automated testing
- **Unified Error Handling**: Consistent error format across all operations
- **Event System**: Subscribe to wallet state changes

## Installation

### Option 1: Copy SDK Directory

Copy the `src/sdk` directory into your project:

```bash
cp -r src/sdk your-project/src/
```

### Option 2: NPM Package (Future)

```bash
npm install @your-org/nft-mint-sdk
```

## Quick Start

### 1. Initialize the SDK

```typescript
import sdk from './sdk';

// Initialize with your configuration
sdk.init({
  apiBaseUrl: 'https://api.your-domain.com',
  chainId: 1, // Ethereum Mainnet
  contractAddress: '0x...', // Optional, can be fetched from API
  testMode: false, // Set to true for development
});
```

### 2. Connect Wallet

```typescript
async function connectWallet() {
  const result = await sdk.connectWallet();

  if (result.ok) {
    console.log('Connected to:', result.data.address);
    console.log('Chain ID:', result.data.chainId);
  } else {
    console.error('Connection failed:', result.message);
    // Handle error (result.code contains error type)
  }
}
```

### 3. Get NFT Data

```typescript
async function loadNftData() {
  // Get contract info
  const infoResult = await sdk.getNftInfo();
  if (infoResult.ok) {
    console.log('NFT Name:', infoResult.data.name);
    console.log('Total Supply:', infoResult.data.totalSupply);
    console.log('Mint Price:', infoResult.data.mintPrice);
  }

  // Get current stats
  const statsResult = await sdk.getNftStats();
  if (statsResult.ok) {
    console.log('Minted:', statsResult.data.totalMinted);
    console.log('Remaining:', statsResult.data.remainingSupply);
    console.log('Funds Raised:', statsResult.data.totalFundsRaised);
  }
}
```

### 4. Mint NFT

```typescript
async function mintNft() {
  const mintPrice = '0.0001'; // ETH
  const result = await sdk.mint(mintPrice);

  if (result.ok) {
    console.log('Success! Tx Hash:', result.data.txHash);
    console.log('Status:', result.data.status);
    console.log('Block Number:', result.data.blockNumber);
  } else {
    console.error('Mint failed:', result.message);
    // Handle specific errors
    switch (result.code) {
      case 'USER_REJECTED':
        console.log('User rejected the transaction');
        break;
      case 'INSUFFICIENT_FUNDS':
        console.log('Insufficient funds');
        break;
      case 'WALLET_NOT_CONNECTED':
        console.log('Please connect wallet first');
        break;
    }
  }
}
```

### 5. Listen to Wallet Changes

```typescript
// Subscribe to wallet state changes
const unsubscribe = sdk.onWalletStateChange((state) => {
  if (state.connected) {
    console.log('Wallet connected:', state.address);
  } else {
    console.log('Wallet disconnected');
  }
});

// Later, clean up
unsubscribe();
```

## API Reference

### Configuration

#### `sdk.init(config: SdkConfig): void`

Initialize the SDK with configuration.

**Parameters:**

```typescript
interface SdkConfig {
  apiBaseUrl: string;              // Backend API base URL
  chainId: number;                 // Target blockchain network ID
  contractAddress?: string;        // NFT contract address (optional)
  rpcUrl?: string;                 // Custom RPC URL (optional)
  walletConnectProjectId?: string; // WalletConnect project ID (optional)
  testMode?: boolean;              // Enable mock mode for testing
  mockWalletAddress?: string;      // Mock wallet address for test mode
}
```

**Example:**

```typescript
sdk.init({
  apiBaseUrl: 'https://api.example.com',
  chainId: 1,
  testMode: process.env.NODE_ENV === 'test',
});
```

---

### Wallet Methods

#### `sdk.connectWallet(): Promise<SdkResult<WalletState>>`

Connect to user's wallet (MetaMask or WalletConnect).

**Returns:**

```typescript
type SdkResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; detail?: any };

interface WalletState {
  connected: boolean;
  address?: string;
  chainId?: number;
}
```

**Example:**

```typescript
const result = await sdk.connectWallet();
if (result.ok) {
  console.log(result.data.address);
}
```

---

#### `sdk.disconnectWallet(): Promise<SdkResult<void>>`

Disconnect the current wallet.

**Example:**

```typescript
await sdk.disconnectWallet();
```

---

#### `sdk.getWalletState(): WalletState`

Get the current wallet connection state synchronously.

**Example:**

```typescript
const state = sdk.getWalletState();
if (state.connected) {
  console.log('Connected:', state.address);
}
```

---

#### `sdk.onWalletStateChange(listener): () => void`

Subscribe to wallet state changes.

**Parameters:**

- `listener: (state: WalletState) => void` - Callback function

**Returns:** Unsubscribe function

**Example:**

```typescript
const unsubscribe = sdk.onWalletStateChange((state) => {
  console.log('State changed:', state);
});

// Clean up when done
unsubscribe();
```

---

#### `sdk.switchNetwork(chainId: number): Promise<SdkResult<void>>`

Request user to switch to a different network.

**Parameters:**

- `chainId: number` - Target chain ID

**Example:**

```typescript
const result = await sdk.switchNetwork(1); // Switch to Ethereum Mainnet
if (!result.ok) {
  console.error('Failed to switch network:', result.message);
}
```

---

### NFT Data Methods

#### `sdk.getNftInfo(): Promise<SdkResult<NftContractInfo>>`

Get NFT contract information.

**Returns:**

```typescript
interface NftContractInfo {
  contractAddress: string;
  totalSupply: number;
  mintPrice: string;
  maxSupply: number;
  name: string;
  symbol: string;
}
```

**Example:**

```typescript
const result = await sdk.getNftInfo();
if (result.ok) {
  console.log('NFT Name:', result.data.name);
  console.log('Price:', result.data.mintPrice);
}
```

---

#### `sdk.getNftStats(): Promise<SdkResult<NftStats>>`

Get current NFT statistics.

**Returns:**

```typescript
interface NftStats {
  totalMinted: number;
  remainingSupply: number;
  totalFundsRaised: string;
  remainingFunds: string;
  lastMintTime: string;
}
```

**Example:**

```typescript
const result = await sdk.getNftStats();
if (result.ok) {
  console.log('Minted:', result.data.totalMinted);
  console.log('Remaining:', result.data.remainingSupply);
}
```

---

### Mint Methods

#### `sdk.mint(mintPrice: string): Promise<SdkResult<TxResult>>`

Mint an NFT.

**Parameters:**

- `mintPrice: string` - Price in ETH (e.g., "0.0001")

**Returns:**

```typescript
interface TxResult {
  txHash: string;
  status: TxStatus;
  blockNumber?: number;
  error?: string;
}

enum TxStatus {
  IDLE = 'idle',
  PENDING = 'pending',
  CONFIRMING = 'confirming',
  SUCCESS = 'success',
  FAILED = 'failed',
}
```

**Example:**

```typescript
const result = await sdk.mint('0.0001');
if (result.ok) {
  console.log('Tx Hash:', result.data.txHash);
  console.log('Status:', result.data.status);
}
```

---

#### `sdk.getTxStatus(txHash: string): Promise<SdkResult<TxResult>>`

Get the status of a transaction.

**Parameters:**

- `txHash: string` - Transaction hash

**Example:**

```typescript
const result = await sdk.getTxStatus('0x...');
if (result.ok) {
  console.log('Status:', result.data.status);
}
```

---

## Error Handling

All SDK methods return a `SdkResult<T>` type:

```typescript
type SdkResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; detail?: any };
```

### Error Codes

```typescript
const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  API_ERROR: 'API_ERROR',
  SOLD_OUT: 'SOLD_OUT',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
```

### Handling Errors

```typescript
const result = await sdk.mint('0.0001');

if (!result.ok) {
  switch (result.code) {
    case 'WALLET_NOT_CONNECTED':
      // Prompt user to connect wallet
      break;
    case 'USER_REJECTED':
      // User cancelled the transaction
      break;
    case 'INSUFFICIENT_FUNDS':
      // Show insufficient funds message
      break;
    case 'WRONG_NETWORK':
      // Prompt user to switch network
      console.log(result.detail.expectedChainId);
      break;
    default:
      // Generic error handling
      console.error(result.message);
  }
}
```

---

## Test Mode

The SDK includes a built-in test mode for development and automated testing.

### Enable Test Mode

```typescript
sdk.init({
  apiBaseUrl: 'http://localhost:8080',
  chainId: 1,
  testMode: true,
  mockWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
});
```

### Test Mode Features

- **Auto-connect**: Wallet connects automatically with mock address
- **Mock Transactions**: No real blockchain interactions
- **Instant Results**: Transactions complete immediately (with simulated delay)
- **No MetaMask Required**: Works without browser extension

### Using with Playwright

```typescript
test('should mint NFT successfully', async ({ page }) => {
  // SDK is already in test mode via environment variables
  await page.goto('/');

  // Wallet auto-connects in test mode
  await expect(page.getByTestId('wallet-address')).toBeVisible();

  // Click mint button
  await page.getByTestId('mint-btn').click();

  // Wait for mock transaction
  await page.waitForTimeout(3000);

  // Verify success
  await expect(page.getByTestId('tx-status')).toContainText('success');
});
```

---

## Best Practices

### 1. Initialize Once

Initialize the SDK once at application startup:

```typescript
// app.ts or main.ts
import sdk from './sdk';

sdk.init({
  apiBaseUrl: process.env.API_BASE_URL,
  chainId: parseInt(process.env.CHAIN_ID),
  testMode: process.env.NODE_ENV === 'test',
});
```

### 2. Check Connection Before Operations

```typescript
async function mintNft() {
  const walletState = sdk.getWalletState();

  if (!walletState.connected) {
    const connectResult = await sdk.connectWallet();
    if (!connectResult.ok) {
      return; // Handle connection failure
    }
  }

  // Proceed with mint
  const result = await sdk.mint('0.0001');
  // ...
}
```

### 3. Subscribe to State Changes

```typescript
// In React
useEffect(() => {
  const unsubscribe = sdk.onWalletStateChange((state) => {
    setWalletState(state);
  });

  return () => unsubscribe();
}, []);

// In Vue
onMounted(() => {
  const unsubscribe = sdk.onWalletStateChange((state) => {
    walletState.value = state;
  });

  onUnmounted(() => unsubscribe());
});
```

### 4. Handle Loading States

```typescript
async function mintNft() {
  setLoading(true);
  setError(null);

  try {
    const result = await sdk.mint('0.0001');

    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
  } finally {
    setLoading(false);
  }
}
```

### 5. Refresh Data After Mint

```typescript
async function mintNft() {
  const result = await sdk.mint('0.0001');

  if (result.ok) {
    // Refresh NFT stats
    await refreshNftData();
  }
}

async function refreshNftData() {
  const statsResult = await sdk.getNftStats();
  if (statsResult.ok) {
    setStats(statsResult.data);
  }
}
```

---

## Framework-Specific Examples

### React

```typescript
import { useEffect, useState } from 'react';
import sdk, { WalletState } from './sdk';

function App() {
  const [walletState, setWalletState] = useState<WalletState>({ connected: false });

  useEffect(() => {
    sdk.init({
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
      chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
    });

    const unsubscribe = sdk.onWalletStateChange(setWalletState);
    setWalletState(sdk.getWalletState());

    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    await sdk.connectWallet();
  };

  return (
    <div>
      {walletState.connected ? (
        <p>Connected: {walletState.address}</p>
      ) : (
        <button onClick={handleConnect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Vue 3

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import sdk from './sdk';

const walletState = ref({ connected: false });

onMounted(() => {
  sdk.init({
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    chainId: parseInt(import.meta.env.VITE_CHAIN_ID),
  });

  const unsubscribe = sdk.onWalletStateChange((state) => {
    walletState.value = state;
  });

  walletState.value = sdk.getWalletState();

  onUnmounted(() => unsubscribe());
});

const handleConnect = async () => {
  await sdk.connectWallet();
};
</script>

<template>
  <div>
    <p v-if="walletState.connected">Connected: {{ walletState.address }}</p>
    <button v-else @click="handleConnect">Connect Wallet</button>
  </div>
</template>
```

### Vanilla JavaScript

```javascript
import sdk from './sdk';

// Initialize
sdk.init({
  apiBaseUrl: 'https://api.example.com',
  chainId: 1,
});

// Subscribe to changes
sdk.onWalletStateChange((state) => {
  if (state.connected) {
    document.getElementById('wallet-address').textContent = state.address;
  } else {
    document.getElementById('wallet-address').textContent = 'Not connected';
  }
});

// Connect button
document.getElementById('connect-btn').addEventListener('click', async () => {
  await sdk.connectWallet();
});

// Mint button
document.getElementById('mint-btn').addEventListener('click', async () => {
  const result = await sdk.mint('0.0001');
  if (result.ok) {
    alert('Mint successful!');
  } else {
    alert('Mint failed: ' + result.message);
  }
});
```

---

## Troubleshooting

### Issue: "SDK not initialized"

**Solution:** Call `sdk.init()` before using any other methods.

### Issue: "MetaMask not installed"

**Solution:** Check if MetaMask is installed or enable test mode for development.

### Issue: "Wrong network"

**Solution:** Prompt user to switch network using `sdk.switchNetwork()`.

### Issue: Transactions timing out

**Solution:** Increase gas limit or check network congestion.

---

## Support

For issues and questions:

- GitHub Issues: https://github.com/your-org/nft-mint-sdk/issues
- Documentation: https://docs.your-domain.com
- Email: support@your-domain.com
