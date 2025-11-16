# 📜 Deployment History

This file tracks all contract deployments across different networks.

---

## ✅ LATEST DEPLOYMENT (Active)

### **ETH Sepolia Testnet**
**Deployment Date**: 2025-11-16
**Network**: Ethereum Sepolia
**Chain ID**: 11155111
**RPC URL**: https://0xrpc.io/sep
**Block Explorer**: https://sepolia.etherscan.io

#### Contract Addresses

**Treasury**
- Proxy: `0xdfE0D74197336f824dE4fca2aff2837588E08A99`
- Implementation: `0x56eC12c82Aae1e0800e7917D6598BCC709526bC0`

**ExplorerToken**
- Proxy: `0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50`
- Implementation: `0xbD6c5BbDb7DD35C3CEaFE9a14527B43A5F17B2cE`

**Minter**
- Proxy: `0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9`
- Implementation: `0xdb2B5ED9dE94B481ADbdA731FB4F81eb5063Da9D`

#### New Features in This Deployment
- ✅ **Vesting System**: Tokens can be locked until a specific timestamp
- ✅ **Dependency Whitelist**: Specific addresses can bypass token dependency requirements
- ✅ **Enhanced Token Dependencies**: More flexible prerequisite token requirements

#### Quick Links
- [ExplorerToken on Etherscan](https://sepolia.etherscan.io/address/0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50)
- [Minter on Etherscan](https://sepolia.etherscan.io/address/0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9)
- [Treasury on Etherscan](https://sepolia.etherscan.io/address/0xdfE0D74197336f824dE4fca2aff2837588E08A99)

---

## 📦 Previous Deployments

### **OP Sepolia Testnet** (Archived)
**Deployment Date**: ~2025-11-15
**Network**: Optimism Sepolia
**Chain ID**: 11155420
**RPC URL**: https://api.zan.top/opt-sepolia
**Block Explorer**: https://sepolia-optimism.etherscan.io

#### Contract Addresses

**Treasury**
- Proxy: `0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233`
- Implementation: `0xA9dC025ED433925Ad8CB8F90D2fCcE9d5F263A97`

**ExplorerToken**
- Proxy: `0x7528A496E0C212fcA3263D272a04309a2330FfC6`
- Implementation: `0xb5d44001E75267bd545596C2BC74A38E2Aa5d5a1`

**Minter**
- Proxy: `0x26F87856E62f2F72feD55938972684c2C1eFDcC9`
- Implementation: `0x897c8b3FDA42d8793afA07791E7bEb2dACec1282`

#### Features
- Basic ERC1155 token system
- Token dependencies (EXPLORER requires POWER)
- Wallet caps
- Whitelist system for EXPLORER token

---

## 📋 Deployment Comparison

| Feature | OP Sepolia | ETH Sepolia (Latest) |
|---------|------------|---------------------|
| Basic Token System | ✅ | ✅ |
| Token Dependencies | ✅ | ✅ |
| Whitelist System | ✅ | ✅ |
| Vesting/Locking | ❌ | ✅ NEW |
| Dependency Whitelist | ❌ | ✅ NEW |
| Network | OP Sepolia | ETH Sepolia |

---

## 🔄 Migration Notes

If you were using the OP Sepolia deployment, please update:

1. **Network Configuration**
   - Chain ID: `11155420` → `11155111`
   - RPC URL: Update to ETH Sepolia RPC
   - Block Explorer: Update to `https://sepolia.etherscan.io`

2. **Contract Addresses**
   - Use the new proxy addresses listed above
   - Update all three contracts: Treasury, ExplorerToken, Minter

3. **New Features Available**
   - Check if tokens have vesting periods using `isVested(tokenId)`
   - Users in dependency whitelist can bypass prerequisites
   - Check vesting time with `vestingTime(tokenId)`

---

## 📝 Notes

- **Always use Proxy addresses** for frontend integration
- Implementation addresses are for reference only
- Each deployment is on a separate testnet
- No mainnet deployment yet

---

**Last Updated**: 2025-11-16
