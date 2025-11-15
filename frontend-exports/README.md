# 前端集成文件说明

这个文件夹包含了前端开发所需的所有合约相关文件。

## 📁 文件列表

### 1. ABI 文件
- **ExplorerToken.abi.json** - ExplorerToken 合约的 ABI（应用程序二进制接口）
- **Minter.abi.json** - Minter 合约的 ABI

### 2. 配置文件
- **contracts.config.js** - JavaScript/CommonJS 配置文件
- **contracts.config.ts** - TypeScript 配置文件（包含类型定义）

### 3. 文档
- **本文件 (README.md)** - 使用说明

## 🚀 快速开始

### 方式 1: 使用 JavaScript

```javascript
// 1. 复制文件到你的项目
// - ExplorerToken.abi.json
// - Minter.abi.json
// - contracts.config.js

// 2. 导入配置
import config from './contracts.config.js';
import ExplorerTokenABI from './ExplorerToken.abi.json';
import MinterABI from './Minter.abi.json';

// 3. 使用配置
const { CONTRACT_ADDRESSES, TOKEN_IDS, NETWORK_CONFIG } = config;

console.log('Minter 合约地址:', CONTRACT_ADDRESSES.Minter);
console.log('POWER 代币价格:', config.TOKEN_CONFIG[TOKEN_IDS.POWER].priceETH, 'ETH');
```

### 方式 2: 使用 TypeScript

```typescript
// 1. 复制文件到你的项目
// - ExplorerToken.abi.json
// - Minter.abi.json
// - contracts.config.ts

// 2. 导入配置
import {
  CONTRACT_ADDRESSES,
  TOKEN_IDS,
  TOKEN_CONFIG,
  NETWORK_CONFIG,
  getTokenInfo,
  calculateCost,
  parseContractError
} from './contracts.config';

import ExplorerTokenABI from './ExplorerToken.abi.json';
import MinterABI from './Minter.abi.json';

// 3. 使用配置（带类型检查）
const tokenInfo = getTokenInfo(TOKEN_IDS.POWER);
console.log(tokenInfo.name); // "POWER"
console.log(tokenInfo.priceETH); // "0.0000001"

const cost = calculateCost(TOKEN_IDS.POWER, 10);
console.log('购买 10 个 POWER 的成本:', cost, 'wei');
```

## 📋 配置文件详细说明

### CONTRACT_ADDRESSES
包含所有已部署合约的地址：
- **ExplorerToken**: ERC1155 代币合约（Proxy 地址）
- **Minter**: 购买合约（Proxy 地址）
- **Treasury**: 资金库合约（Proxy 地址）

**重要：前端只需要使用 Proxy 地址，不要使用 Implementation 地址！**

### TOKEN_IDS
代币 ID 常量：
```javascript
TOKEN_IDS.POWER = 1
TOKEN_IDS.OIL = 2
TOKEN_IDS.EXPLORER = 3
```

### TOKEN_CONFIG
每个代币的详细配置：
```javascript
{
  id: 1,
  name: 'POWER',
  priceWei: '100000000000',  // wei 单位的价格
  priceETH: '0.0000001',     // ETH 单位的价格（方便显示）
  maxSupply: 3000,           // 最大供应量
  walletCap: 1000,           // 每个钱包最多持有数量
  whitelistRequired: false   // 是否需要白名单
}
```

### NETWORK_CONFIG
OP Sepolia 测试网配置：
```javascript
{
  chainId: 11155420,
  chainIdHex: '0xaa37dc',
  chainName: 'OP Sepolia',
  rpcUrl: 'https://api.zan.top/opt-sepolia',
  blockExplorer: 'https://sepolia-optimism.etherscan.io'
}
```

## 🔧 工具函数

### getTokenInfo(tokenId)
获取代币信息
```javascript
const info = getTokenInfo(TOKEN_IDS.POWER);
// 返回: { id: 1, name: 'POWER', priceWei: '...', ... }
```

### calculateCost(tokenId, amount)
计算购买成本（wei）
```javascript
const cost = calculateCost(TOKEN_IDS.POWER, 10);
// 返回: "1000000000000" (10 * 0.0000001 ETH in wei)
```

### weiToETH(wei)
将 wei 转换为 ETH 显示
```javascript
const eth = weiToETH('100000000000');
// 返回: "0.0000001000"
```

### getExplorerUrls(addressOrHash, type)
生成区块浏览器链接
```javascript
const url = getExplorerUrls('0x123...', 'address');
// 返回: "https://sepolia-optimism.etherscan.io/address/0x123..."
```

### parseContractError(error)
解析合约错误为友好消息
```javascript
try {
  // ... 交易失败
} catch (error) {
  const message = parseContractError(error);
  alert(message); // "钱包持有上限已超出"
}
```

## 📦 与 Web3 库集成

### 使用 ethers.js v6
```javascript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config';
import MinterABI from './Minter.abi.json';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const minter = new ethers.Contract(
  CONTRACT_ADDRESSES.Minter,
  MinterABI,
  signer
);

// 购买代币
const tx = await minter.buy(
  TOKEN_IDS.POWER,
  10,
  await signer.getAddress(),
  { value: '1000000000000' }
);
```

### 使用 viem
```javascript
import { createPublicClient, http } from 'viem';
import { optimismSepolia } from 'viem/chains';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config';
import MinterABI from './Minter.abi.json';

const client = createPublicClient({
  chain: optimismSepolia,
  transport: http()
});

const price = await client.readContract({
  address: CONTRACT_ADDRESSES.Minter,
  abi: MinterABI,
  functionName: 'priceWei',
  args: [TOKEN_IDS.POWER]
});
```

### 使用 wagmi (React)
```typescript
import { useContractRead, useContractWrite } from 'wagmi';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config';
import MinterABI from './Minter.abi.json';

function BuyButton() {
  const { write } = useContractWrite({
    address: CONTRACT_ADDRESSES.Minter,
    abi: MinterABI,
    functionName: 'buy',
  });

  const handleBuy = () => {
    write({
      args: [TOKEN_IDS.POWER, 10, '0xYourAddress'],
      value: BigInt('1000000000000')
    });
  };

  return <button onClick={handleBuy}>Buy 10 POWER</button>;
}
```

## ⚠️ 重要提示

1. **使用 Proxy 地址**：前端交互时必须使用 `CONTRACT_ADDRESSES` 中的 Proxy 地址，不要使用 Implementation 地址

2. **代币 ID**：
   - POWER = 1
   - OIL = 2
   - EXPLORER = 3

3. **价格计算**：
   - 价格是固定的：0.0000001 ETH (100,000,000,000 wei)
   - 总价 = 单价 × 数量
   - 必须精确支付，多一点或少一点都会失败

4. **钱包上限**：
   - 每种代币每个钱包最多持有 1000 个
   - 尝试超过此限制会交易失败

5. **白名单**：
   - TOKEN_EXPLORER (ID: 3) 需要白名单
   - 购买前检查 `minter.whitelist(address)` 或 `minter.isWhitelisted(address)`

6. **网络**：
   - 必须连接到 OP Sepolia 测试网 (Chain ID: 11155420)
   - 需要 OP Sepolia 测试网的 ETH

## 🔗 相关链接

- **OP Sepolia 浏览器**: https://sepolia-optimism.etherscan.io
- **OP Sepolia 水龙头**: https://www.alchemy.com/faucets/optimism-sepolia
- **ExplorerToken 合约**: https://sepolia-optimism.etherscan.io/address/0x7528A496E0C212fcA3263D272a04309a2330FfC6
- **Minter 合约**: https://sepolia-optimism.etherscan.io/address/0x26F87856E62f2F72feD55938972684c2C1eFDcC9

## 📞 需要帮助？

查看 `FRONTEND_INTEGRATION.md` 获取更详细的集成示例和完整 API 文档。
