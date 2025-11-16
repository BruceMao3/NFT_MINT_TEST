# Multi-Chain Configuration Guide

This project supports multiple blockchain networks with easy switching between them.

## Available Networks

### 1. ETH Sepolia (Latest - Active)
- **Chain ID**: 11155111
- **RPC URL**: https://0xrpc.io/sep
- **Block Explorer**: https://sepolia.etherscan.io
- **Deployment Date**: 2025-11-16
- **Features**:
  - ✅ Vesting System (token locking)
  - ✅ Dependency Whitelist
  - ✅ Enhanced Token Dependencies

**Contract Addresses**:
- Minter: `0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9`
- ExplorerToken: `0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50`
- Treasury: `0xdfE0D74197336f824dE4fca2aff2837588E08A99`

### 2. OP Sepolia (Archived)
- **Chain ID**: 11155420
- **RPC URL**: https://api.zan.top/opt-sepolia
- **Block Explorer**: https://sepolia-optimism.etherscan.io
- **Deployment Date**: ~2025-11-15
- **Features**:
  - ✅ Basic ERC1155 token system
  - ✅ Token dependencies
  - ✅ Whitelist system

**Contract Addresses**:
- Minter: `0x26F87856E62f2F72feD55938972684c2C1eFDcC9`
- ExplorerToken: `0x7528A496E0C212fcA3263D272a04309a2330FfC6`
- Treasury: `0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233`

## How to Switch Networks

### Method 1: Copy from Chain-Specific Config Files

1. Locate the chain-specific configuration file:
   - `.env.sepolia` for ETH Sepolia
   - `.env.opsepolia` for OP Sepolia

2. Copy the content from the desired file

3. Paste it into the main `.env` file

4. Restart your development server:
   ```bash
   npm run dev
   ```

### Method 2: Manual Configuration

Edit the `.env` file and update these key variables:

```bash
# For ETH Sepolia
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://0xrpc.io/sep
VITE_MINTER_CONTRACT=0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9
VITE_TOKEN_CONTRACT=0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50
VITE_TREASURY_CONTRACT=0xdfE0D74197336f824dE4fca2aff2837588E08A99
VITE_BLOCK_EXPLORER_URL=https://sepolia.etherscan.io
```

```bash
# For OP Sepolia
VITE_CHAIN_ID=11155420
VITE_RPC_URL=https://api.zan.top/opt-sepolia
VITE_MINTER_CONTRACT=0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT=0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT=0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_BLOCK_EXPLORER_URL=https://sepolia-optimism.etherscan.io
```

## Configuration Files Structure

```
.
├── .env                    # Active configuration (currently ETH Sepolia)
├── .env.example           # Template with multi-chain instructions
├── .env.sepolia           # ETH Sepolia configuration
├── .env.opsepolia         # OP Sepolia configuration
└── src/contracts/config.ts # Frontend contract configuration (synced with .env)
```

## Important Notes

1. **Always Use Proxy Addresses**: The contract addresses listed above are proxy addresses. Never use implementation addresses for frontend interactions.

2. **Environment Variables**: All environment variables are prefixed with `VITE_` for Vite compatibility.

3. **Network Switching**: After switching networks, ensure you also switch your wallet to the corresponding network.

4. **Backend Configuration**: The backend is network-agnostic and uses the contract addresses from the frontend configuration.

5. **Contract Features**: Different deployments may have different features. Check the deployment history in `frontend-exports/DEPLOYMENT_HISTORY.md` for details.

## Adding a New Network

To add support for a new network:

1. Create a new `.env.{network}` file (e.g., `.env.mainnet`)

2. Add the network configuration:
   ```bash
   # Blockchain Configuration - {Network Name}
   VITE_CHAIN_ID={chain_id}
   VITE_RPC_URL={rpc_url}

   # Contract Addresses
   VITE_MINTER_CONTRACT={minter_proxy_address}
   VITE_TOKEN_CONTRACT={token_proxy_address}
   VITE_TREASURY_CONTRACT={treasury_proxy_address}

   # Block Explorer
   VITE_BLOCK_EXPLORER_URL={explorer_url}
   ```

3. Update this README with the new network details

4. Update `src/contracts/config.ts` if needed for network-specific configurations

## Verification

To verify your configuration:

1. Check the chain ID in your browser console
2. Verify contract addresses on the block explorer
3. Test a small transaction to ensure everything works

## Troubleshooting

**Issue**: Transactions failing after switching networks
- **Solution**: Clear browser cache and restart dev server

**Issue**: Wrong network in wallet
- **Solution**: Manually switch wallet to match VITE_CHAIN_ID

**Issue**: Contract not found errors
- **Solution**: Verify you're using proxy addresses, not implementation addresses

## Related Documentation

- Contract deployment history: `frontend-exports/DEPLOYMENT_HISTORY.md`
- Contract configuration: `frontend-exports/INDEX.md`
- Quick start guide: `frontend-exports/QUICK_START.md`
