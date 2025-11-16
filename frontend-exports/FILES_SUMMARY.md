# 📂 Frontend Exports - 文件总结

**最后更新**: 2025-11-16
**当前网络**: ETH Sepolia Testnet

---

## 🌟 最新文件（必需）

前端开发者请使用这些文件：

### 配置文件
```
✅ contracts.config.sepolia.ts  (7.2KB)  - TypeScript 配置 [最新]
✅ contracts.config.sepolia.js  (6.3KB)  - JavaScript 配置 [最新]
```

### ABI 文件
```
✅ ExplorerToken.abi.json  (221KB)  - 代币合约 ABI (含 vesting)
✅ Minter.abi.json         (136KB)  - 铸造合约 ABI (含依赖白名单)
✅ Treasury.abi.json       (93KB)   - 金库合约 ABI [新增]
```

---

## 📚 历史文件（仅供参考）

旧的 OP Sepolia 部署配置（保留作为参考）：

```
📦 contracts.config.ts      (4.6KB)  - TypeScript 配置 [OP Sepolia]
📦 contracts.config.js      (4.2KB)  - JavaScript 配置 [OP Sepolia]
```

---

## 📖 文档文件

```
📄 INDEX.md                (11KB)   - 主索引文件 [从这里开始]
📄 DEPLOYMENT_HISTORY.md   (3.4KB)  - 部署历史记录
📄 QUICK_START.md          (8.1KB)  - 快速开始指南
📄 README.md               (6.6KB)  - 详细说明
📄 FILES_SUMMARY.md        (本文件)  - 文件总结
```

---

## 🎯 快速选择指南

### 我是 TypeScript 开发者
```bash
# 复制这 4 个文件
cp contracts.config.sepolia.ts   /your-project/src/
cp ExplorerToken.abi.json        /your-project/src/
cp Minter.abi.json               /your-project/src/
cp Treasury.abi.json             /your-project/src/
```

### 我是 JavaScript 开发者
```bash
# 复制这 4 个文件
cp contracts.config.sepolia.js   /your-project/src/
cp ExplorerToken.abi.json        /your-project/src/
cp Minter.abi.json               /your-project/src/
cp Treasury.abi.json             /your-project/src/
```

### 我只想快速测试
```bash
# 直接在浏览器中打开
open example.html
```

---

## 📊 文件对比

| 功能 | OP Sepolia (旧) | ETH Sepolia (新) ⭐ |
|------|----------------|-------------------|
| 配置文件 | contracts.config.* | contracts.config.sepolia.* |
| Network | OP Sepolia | ETH Sepolia |
| Chain ID | 11155420 | 11155111 |
| Vesting 功能 | ❌ | ✅ |
| 依赖白名单 | ❌ | ✅ |
| Treasury ABI | ❌ | ✅ |

---

## 🔑 关键合约地址

### ETH Sepolia (最新) ⭐
```
Treasury:      0xdfE0D74197336f824dE4fca2aff2837588E08A99
ExplorerToken: 0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50
Minter:        0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9
```

### OP Sepolia (历史)
```
Treasury:      0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
ExplorerToken: 0x7528A496E0C212fcA3263D272a04309a2330FfC6
Minter:        0x26F87856E62f2F72feD55938972684c2C1eFDcC9
```

---

## ⚠️ 重要提醒

1. **使用最新文件**: 请使用 `contracts.config.sepolia.*`
2. **网络切换**: 确保钱包连接到 ETH Sepolia (Chain ID: 11155111)
3. **包含 Treasury**: 新部署包含独立的 Treasury 合约
4. **新功能**: 支持 vesting 和依赖白名单

---

## 📞 需要帮助？

- 新手: 查看 [INDEX.md](INDEX.md)
- 快速上手: 查看 [QUICK_START.md](QUICK_START.md)
- 部署信息: 查看 [DEPLOYMENT_HISTORY.md](DEPLOYMENT_HISTORY.md)
