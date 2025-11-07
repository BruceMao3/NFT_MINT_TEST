# Quick Start Guide

Get the NFT Mint test project running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React & TypeScript
- Vite (build tool)
- Playwright (testing framework)
- All required dependencies

### 2. Run in Development Mode

```bash
npm run dev
```

The application will start at `http://localhost:3000`

**Note**: By default, the app runs in **test mode**, which means:
- ✅ No MetaMask required
- ✅ Wallet auto-connects with a mock address
- ✅ Transactions are simulated (no real blockchain)
- ✅ Perfect for development and testing

### 3. View the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see:
- ✅ Connected wallet address (auto-connected in test mode)
- ✅ NFT statistics (Total Supply, Remaining, Minted, Funds)
- ✅ Mint button (ready to use)

### 4. Test the Mint Flow

1. Click the "Mint NFT (0.0001 ETH)" button
2. Wait 2-3 seconds for the simulated transaction
3. See success message with transaction hash
4. Notice the statistics update automatically

### 5. Run Automated Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run tests
npm test
```

This will:
- Start the dev server automatically
- Run all Playwright tests
- Generate a test report

### 6. View Test Report

After tests complete:

```bash
npx playwright show-report
```

## Next Steps

### Switch to Production Mode

To test with real MetaMask:

1. Edit `.env` file:
   ```bash
   VITE_TEST_MODE=false
   ```

2. Configure your backend API:
   ```bash
   VITE_API_BASE_URL=https://your-backend-api.com
   VITE_CONTRACT_ADDRESS=0xYourContractAddress
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

4. Install MetaMask browser extension

5. Connect your wallet when prompted

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
NFT_MINT_TEST/
├── src/
│   ├── sdk/           # Blockchain SDK (framework-agnostic)
│   ├── App.tsx        # Main React component
│   └── main.tsx       # Entry point
├── tests/             # Playwright test files
├── docs/              # Documentation
├── .env               # Environment variables
└── package.json       # Dependencies and scripts
```

## Key Features to Explore

1. **Wallet Connection**: Auto-connects in test mode, manual in production
2. **NFT Statistics**: Real-time display of mint progress
3. **Mint Functionality**: One-click minting with status feedback
4. **Responsive Design**: Works on mobile and desktop
5. **Error Handling**: Graceful handling of all error scenarios
6. **Test Mode**: Full functionality without blockchain

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:ui          # Run tests with UI
npm run test:debug       # Debug tests
```

## Troubleshooting

### Port 3000 already in use

Change the port in `vite.config.ts`:

```typescript
server: {
  port: 3001, // Change to any available port
}
```

### Tests fail to start

Make sure Playwright browsers are installed:

```bash
npx playwright install
```

### Application shows "-" for all stats

This means the mock API is not responding. Check:
1. `.env` file exists
2. `VITE_API_BASE_URL` is set
3. Dev server is running

## Need Help?

- 📖 Read the [full README](./README.md)
- 🔧 Check [SDK Integration Guide](./docs/SDK_INTEGRATION.md)
- 🐛 Report issues on GitHub
- 📧 Contact support

## What's Next?

- Explore the SDK code in `src/sdk/`
- Read the integration guide for using SDK in other projects
- Customize the UI in `src/App.tsx`
- Add more tests in `tests/`
- Deploy to your hosting platform

Happy coding! 🚀
