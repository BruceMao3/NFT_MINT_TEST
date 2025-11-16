# 📦 前端集成文件包 - 索引

欢迎！这个文件夹包含了前端开发所需的所有合约相关文件。

---

## 🔥 最新部署信息 (2025-11-16)

### ⚡ ETH Sepolia Testnet - **当前使用此网络**

**合约地址（只需要 Proxy 地址）**
```
Treasury (金库):          0xdfE0D74197336f824dE4fca2aff2837588E08A99
ExplorerToken (代币合约): 0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50
Minter (购买合约):        0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9
```

**网络配置**
```
网络名称: Sepolia
Chain ID: 11155111 (0xaa36a7)
RPC URL:  https://0xrpc.io/sep
浏览器:   https://sepolia.etherscan.io
```

**新增功能** ✨
- 🔒 **Vesting 锁仓系统**: 代币可以设置解锁时间
- ⚡ **依赖白名单**: 特定地址可以绕过代币依赖要求
- 📦 **Treasury 合约**: 完整的资金管理系统

**快速链接**
- [ExplorerToken 合约](https://sepolia.etherscan.io/address/0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50)
- [Minter 合约](https://sepolia.etherscan.io/address/0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9)
- [Treasury 合约](https://sepolia.etherscan.io/address/0xdfE0D74197336f824dE4fca2aff2837588E08A99)
- [获取测试 ETH](https://www.alchemy.com/faucets/ethereum-sepolia)

---

## 📋 快速导航

### 🚀 新手开始
1. **先看这个**: [QUICK_START.md](QUICK_START.md) - 5分钟快速上手
2. **试试这个**: [example.html](example.html) - 打开浏览器直接测试
3. **部署历史**: [DEPLOYMENT_HISTORY.md](DEPLOYMENT_HISTORY.md) - 查看所有部署记录

### 📚 详细文档
4. **完整指南**: [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) - 详细集成文档
5. **文件说明**: [README.md](README.md) - 文件结构和用途

---

## 📁 文件清单

### ✅ 必需文件（前端开发必须）- 使用最新的 Sepolia 版本

| 文件 | 说明 | 网络 | 大小 |
|------|------|------|------|
| **`contracts.config.sepolia.ts`** ⭐ | **TypeScript 配置 (最新)** | ETH Sepolia | 8KB |
| **`contracts.config.sepolia.js`** ⭐ | **JavaScript 配置 (最新)** | ETH Sepolia | 7KB |
| **`ExplorerToken.abi.json`** ⭐ | **ExplorerToken ABI (含 vesting)** | 通用 | 221KB |
| **`Minter.abi.json`** ⭐ | **Minter ABI (含依赖白名单)** | 通用 | 136KB |
| **`Treasury.abi.json`** ⭐ | **Treasury ABI (新增)** | 通用 | 93KB |

### 📚 历史文件（仅供参考）

| 文件 | 说明 | 网络 |
|------|------|------|
| `contracts.config.ts` | TypeScript 配置 (旧版) | OP Sepolia |
| `contracts.config.js` | JavaScript 配置 (旧版) | OP Sepolia |

### 📖 参考文件（学习和测试用）

| 文件 | 说明 |
|------|------|
| `DEPLOYMENT_HISTORY.md` | 完整的部署历史记录 |
| `example.html` | 完整的 HTML 示例页面 |
| `QUICK_START.md` | 快速开始指南 |
| `README.md` | 详细文件说明 |
| `INDEX.md` | 本文件 |

---

## 🎯 给前端开发者的信息

### 最重要的 3 个信息

**1. 使用最新配置文件** ⭐
```javascript
// TypeScript 项目
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, TOKEN_IDS } from './contracts.config.sepolia.ts';

// JavaScript 项目
import { CONTRACT_ADDRESSES, NETWORK_CONFIG, TOKEN_IDS } from './contracts.config.sepolia.js';
```

**2. 合约地址（只需要 Proxy 地址）**
```
Treasury:      0xdfE0D74197336f824dE4fca2aff2837588E08A99
ExplorerToken: 0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50
Minter:        0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9
```

**3. 网络配置**
```
网络: ETH Sepolia
Chain ID: 11155111
RPC: https://0xrpc.io/sep
```

### 代币配置

| Token | ID | 价格 | 最大供应 | 钱包上限 | 需要白名单 | 有依赖 |
|-------|-----|------|---------|---------|-----------|--------|
| POWER | 1 | 0.0000001 ETH | 3000 | 1000 | ❌ | ❌ |
| OIL | 2 | 0.0000001 ETH | 3000 | 1000 | ❌ | ❌ |
| EXPLORER | 3 | 0.0000001 ETH | 1000 | 1000 | ✅ | ✅* |

*EXPLORER 可能需要先持有 POWER 代币（取决于合约配置）

---

## 🆕 新功能使用指南

### 1. 检查代币是否被锁定（Vesting）

```javascript
import TokenABI from './ExplorerToken.abi.json';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config.sepolia';

const token = new ethers.Contract(
  CONTRACT_ADDRESSES.ExplorerToken,
  TokenABI,
  provider
);

// 检查 POWER 代币是否被锁定
const isLocked = await token.isVested(TOKEN_IDS.POWER);
console.log('Token locked:', isLocked);

// 获取解锁时间
const vestingTime = await token.vestingTime(TOKEN_IDS.POWER);
console.log('Unlock time:', new Date(Number(vestingTime) * 1000));
```

### 2. 检查代币依赖关系

```javascript
import MinterABI from './Minter.abi.json';

const minter = new ethers.Contract(
  CONTRACT_ADDRESSES.Minter,
  MinterABI,
  provider
);

// 查询 EXPLORER 的依赖关系
const dependency = await minter.getDependency(TOKEN_IDS.EXPLORER);
console.log('Prerequisite token ID:', dependency.prereqId);
console.log('Minimum balance required:', dependency.minBalance);
```

### 3. 检查是否在依赖白名单中

```javascript
// 检查某个地址是否可以绕过依赖检查
const canBypass = await minter.isDependencyWhitelisted(
  TOKEN_IDS.EXPLORER,
  userAddress
);
console.log('Can bypass dependency:', canBypass);
```

---

## 🚀 3 分钟快速开始

### 方式 1: 直接测试（最简单）
```bash
# 用浏览器打开
open example.html

# 或者在本地启动服务器
npx serve .
# 然后访问 http://localhost:3000/example.html
```

### 方式 2: 集成到项目
```bash
# 1. 复制必需文件到你的项目
cp ExplorerToken.abi.json /your-project/src/
cp Minter.abi.json /your-project/src/
cp Treasury.abi.json /your-project/src/
cp contracts.config.sepolia.js /your-project/src/  # 或 .ts

# 2. 安装依赖
npm install ethers@6

# 3. 在代码中导入
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config.sepolia';
import MinterABI from './Minter.abi.json';
```

---

## 💡 常用代码片段

### 连接钱包
```javascript
import { ethers } from 'ethers';
import { NETWORK_CONFIG } from './contracts.config.sepolia';

const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);

// 检查并切换网络
const network = await provider.getNetwork();
if (network.chainId !== NETWORK_CONFIG.chainId) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
  });
}

const signer = await provider.getSigner();
```

### 查询余额
```javascript
import TokenABI from './ExplorerToken.abi.json';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config.sepolia';

const token = new ethers.Contract(
  CONTRACT_ADDRESSES.ExplorerToken,
  TokenABI,
  signer
);

const balance = await token.balanceOf(userAddress, TOKEN_IDS.POWER);
console.log('POWER balance:', balance.toString());
```

### 购买代币
```javascript
import MinterABI from './Minter.abi.json';
import { calculateCost } from './contracts.config.sepolia';

const minter = new ethers.Contract(
  CONTRACT_ADDRESSES.Minter,
  MinterABI,
  signer
);

// 购买 10 个 POWER
const amount = 10;
const cost = calculateCost(TOKEN_IDS.POWER, amount);

const tx = await minter.buy(
  TOKEN_IDS.POWER,
  amount,
  userAddress,
  { value: cost }
);

await tx.wait(); // 等待确认
console.log('Purchase successful!');
```

---

## 🔍 快速检查清单

在开始开发前，确保：
- [ ] 已安装 MetaMask 浏览器插件
- [ ] **已切换到 ETH Sepolia 网络** ⚠️
- [ ] 已获取 Sepolia 测试 ETH（[水龙头](https://www.alchemy.com/faucets/ethereum-sepolia)）
- [ ] 已复制最新的配置文件（`contracts.config.sepolia.*`）
- [ ] 已复制所有 3 个 ABI 文件
- [ ] 已安装 ethers.js 或 viem
- [ ] 已查看 example.html 了解基本流程

---

## 📞 获取帮助

按优先级查看文档：
1. **部署信息**: 查看 [DEPLOYMENT_HISTORY.md](DEPLOYMENT_HISTORY.md)
2. **快速问题**: 查看 [QUICK_START.md](QUICK_START.md) 的常见问题部分
3. **代码示例**: 查看 [example.html](example.html) 的源代码
4. **详细文档**: 查看 [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
5. **合约源码**: 查看项目 `src/` 目录

---

## 🎨 推荐的技术栈

### Web3 库
- **ethers.js v6** ⭐ 推荐（文档完善，社区大）
- **viem** （性能好，TypeScript 友好）
- **wagmi** （React 专用，基于 viem）

### UI 框架
- **React** + wagmi/ethers
- **Vue** + ethers
- **Next.js** + wagmi
- **纯 HTML/JS** + ethers（见 example.html）

---

## 🌐 重要链接

### 当前部署 (ETH Sepolia) ⭐

| 资源 | URL |
|------|-----|
| 区块浏览器 | https://sepolia.etherscan.io |
| ExplorerToken | https://sepolia.etherscan.io/address/0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50 |
| Minter | https://sepolia.etherscan.io/address/0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9 |
| Treasury | https://sepolia.etherscan.io/address/0xdfE0D74197336f824dE4fca2aff2837588E08A99 |
| 测试 ETH 水龙头 | https://www.alchemy.com/faucets/ethereum-sepolia |

### 历史部署 (OP Sepolia) - 仅供参考

| 资源 | URL |
|------|-----|
| 区块浏览器 | https://sepolia-optimism.etherscan.io |
| ExplorerToken | https://sepolia-optimism.etherscan.io/address/0x7528A496E0C212fcA3263D272a04309a2330FfC6 |
| Minter | https://sepolia-optimism.etherscan.io/address/0x26F87856E62f2F72feD55938972684c2C1eFDcC9 |

---

## 📊 合约功能状态

### ETH Sepolia 部署 (最新) ✅

**核心功能**
- ✅ ERC1155 多代币系统
- ✅ 代币购买和铸造
- ✅ 白名单系统
- ✅ 钱包持仓上限
- ✅ 供应量上限

**新增功能** 🆕
- ✅ **Vesting 锁仓**: 代币可以锁定到指定时间
- ✅ **依赖白名单**: 绕过代币依赖检查
- ✅ **Treasury 合约**: 资金管理和提取
- ✅ **增强的依赖系统**: 更灵活的前置要求

**测试状态**
- ✅ 部署成功
- ✅ 所有 Foundry 测试通过
- ⏳ 前端集成测试待完成

---

## 🎯 下一步

### 如果你是第一次使用
1. 打开 `example.html` 在浏览器中试试
2. 确保钱包连接到 **ETH Sepolia** 网络
3. 获取测试 ETH
4. 尝试购买 POWER 或 OIL 代币

### 如果要集成到项目
1. 复制 `contracts.config.sepolia.*` 到你的项目
2. 复制所有 3 个 ABI 文件
3. 查看 `QUICK_START.md` 了解详细步骤
4. 参考代码示例开始开发

### 如果需要详细文档
1. 查看 `DEPLOYMENT_HISTORY.md` 了解部署详情
2. 查看 `FRONTEND_INTEGRATION.md` 了解完整集成方案
3. 查看合约源码了解业务逻辑

---

## ⚠️ 重要提醒

1. **网络变更**: 最新部署已从 **OP Sepolia** 迁移到 **ETH Sepolia**
2. **使用新配置**: 请使用 `contracts.config.sepolia.*` 而不是旧的配置文件
3. **新增 Treasury**: 现在有独立的 Treasury 合约管理资金
4. **新功能**: 支持 vesting 和依赖白名单功能
5. **测试网**: 这仍然是测试网部署，请勿用于生产环境

---

**祝开发顺利！** 🚀

**Last Updated**: 2025-11-16
