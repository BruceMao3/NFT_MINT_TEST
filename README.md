# NFT Mint Test Project

A comprehensive test project for NFT minting functionality with automated testing support.

## Overview

This project demonstrates a production-ready NFT minting interface with:

- **Framework-agnostic SDK** for blockchain interactions
- **Clean separation** between UI and blockchain logic
- **Automated testing** with Playwright
- **Mock mode** for development and testing without real blockchain
- **Testnet/Mainnet support** for production deployment

## Architecture

The project follows a modular SDK-based architecture:

```
src/
├── sdk/              # Framework-agnostic blockchain SDK
│   ├── index.ts      # Main SDK export
│   ├── types.ts      # TypeScript types
│   ├── wallet.ts     # Wallet connection logic
│   ├── contract.ts   # Smart contract interactions
│   └── api.ts        # Backend API calls
├── App.tsx           # React UI (can be replaced with any framework)
└── main.tsx          # Entry point
```

### Key Design Principles

1. **SDK-First Development**: All blockchain logic is encapsulated in the SDK
2. **Technology Agnostic**: SDK has no React/Vue dependencies
3. **Test Mode Support**: Built-in mock mode for automated testing
4. **Dependency Injection**: Easy to swap providers for testing

## Setup

### Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension (for production mode)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# For testing, set VITE_TEST_MODE=true
```

### Environment Variables

```bash
# Blockchain Configuration
VITE_CHAIN_ID=1                    # Ethereum Mainnet
VITE_RPC_URL=your_rpc_url          # RPC endpoint

# Backend API
VITE_API_BASE_URL=http://localhost:8080

# Contract (fetched from API in production)
VITE_CONTRACT_ADDRESS=0x...
VITE_MINT_PRICE=0.0001

# WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Test Mode
VITE_TEST_MODE=true                # Enable mock mode
VITE_MOCK_WALLET_ADDRESS=0x...     # Mock wallet address
```

## Usage

### Development Mode

```bash
# Start development server
npm run dev

# Visit http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

## SDK Usage

The SDK can be used independently of the React UI. Here's how to integrate it into any frontend:

### Initialize SDK

```typescript
import sdk from './sdk';

sdk.init({
  apiBaseUrl: 'https://api.your-domain.com',
  chainId: 1,
  contractAddress: '0x...',
  testMode: false, // Set to true for testing
});
```

### Connect Wallet

```typescript
const result = await sdk.connectWallet();

if (result.ok) {
  console.log('Connected:', result.data.address);
} else {
  console.error('Error:', result.message);
}
```

### Get NFT Information

```typescript
const infoResult = await sdk.getNftInfo();
const statsResult = await sdk.getNftStats();

if (infoResult.ok && statsResult.ok) {
  console.log('Total Supply:', infoResult.data.totalSupply);
  console.log('Minted:', statsResult.data.totalMinted);
}
```

### Mint NFT

```typescript
const result = await sdk.mint('0.0001');

if (result.ok) {
  console.log('Transaction Hash:', result.data.txHash);
  console.log('Status:', result.data.status);
} else {
  console.error('Mint failed:', result.message);
}
```

### Listen to Wallet Changes

```typescript
const unsubscribe = sdk.onWalletStateChange((state) => {
  console.log('Wallet state changed:', state);
});

// Clean up
unsubscribe();
```

## Testing Strategy

### Automated Testing with Playwright

The project includes comprehensive Playwright tests that:

1. **Test without browser wallet plugins**: Uses SDK mock mode
2. **Test complete user flows**: Connection → Mint → Verification
3. **Mock blockchain and API**: No real transactions in tests
4. **Verify UI state changes**: Button states, loading indicators, success messages

### Test Structure

```
tests/
├── nft-mint.spec.ts       # Main test suite
└── mock-server.ts         # API mocking utilities
```

### Key Test Scenarios

- ✅ Page loads and displays correctly
- ✅ Wallet auto-connects in test mode
- ✅ NFT statistics display properly
- ✅ Mint button states (enabled/disabled/loading)
- ✅ Mint transaction flow completes successfully
- ✅ Stats update after mint
- ✅ Sold out state handling
- ✅ Error handling
- ✅ Responsive design (mobile/desktop)

## API Endpoints

The project expects the following backend endpoints:

### GET /api/nft/info

Returns NFT contract information.

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "contractAddress": "0x...",
    "totalSupply": 10000,
    "mintPrice": "0.0001",
    "maxSupply": 10000,
    "name": "Test NFT Collection",
    "symbol": "TNFT"
  }
}
```

### GET /api/nft/stats

Returns current minting statistics.

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalMinted": 1766,
    "remainingSupply": 8234,
    "totalFundsRaised": "0.1766",
    "remainingFunds": "0.8234",
    "lastMintTime": "2025-11-07T10:30:45Z"
  }
}
```

### POST /api/nft/mint-record

Records a mint transaction.

```json
// Request
{
  "walletAddress": "0x...",
  "txHash": "0x...",
  "amount": "0.0001",
  "timestamp": "2025-11-07T10:30:45Z"
}

// Response
{
  "code": 200,
  "message": "Record saved successfully",
  "data": {
    "recordId": "rec_1234567890"
  }
}
```

## Features

### Implemented

- ✅ MetaMask wallet connection
- ✅ Network detection and switching
- ✅ NFT statistics display
- ✅ Mint functionality with transaction tracking
- ✅ Test mode for development
- ✅ Automated Playwright tests
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

### Future Enhancements

- [ ] WalletConnect support
- [ ] Transaction history
- [ ] Gas estimation
- [ ] Multiple NFT minting
- [ ] Whitelist verification
- [ ] Social sharing

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: ethers.js concepts (wrapped in SDK)
- **Testing**: Playwright
- **Styling**: Pure CSS (no framework dependency)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT

## Contributing

This is a test project. Feel free to fork and modify for your needs.

## Support

For issues and questions, please open an issue on GitHub.
