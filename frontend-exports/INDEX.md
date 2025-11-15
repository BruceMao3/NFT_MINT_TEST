# 📦 前端集成文件包 - 索引

欢迎！这个文件夹包含了前端开发所需的所有合约相关文件。

## 📋 快速导航

### 🚀 新手开始
1. **先看这个**: [QUICK_START.md](QUICK_START.md) - 5分钟快速上手
2. **试试这个**: [example.html](example.html) - 打开浏览器直接测试

### 📚 详细文档
3. **完整指南**: [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) - 详细集成文档
4. **文件说明**: [README.md](README.md) - 文件结构和用途

## 📁 文件清单

### 必需文件（前端开发必须）
| 文件 | 说明 | 大小 |
|------|------|------|
| `ExplorerToken.abi.json` | ExplorerToken 合约 ABI | 26KB |
| `Minter.abi.json` | Minter 合约 ABI | 17KB |
| `contracts.config.js` | JavaScript 配置文件 | 4.2KB |
| `contracts.config.ts` | TypeScript 配置文件 | 4.6KB |

### 参考文件（学习和测试用）
| 文件 | 说明 |
|------|------|
| `example.html` | 完整的 HTML 示例页面 |
| `QUICK_START.md` | 快速开始指南 |
| `README.md` | 详细文件说明 |
| `INDEX.md` | 本文件 |

## 🎯 给前端开发者的信息

### 最重要的 3 个信息

**1. 合约地址（只需要 Proxy 地址）**
```
Minter (购买合约):        0x26F87856E62f2F72feD55938972684c2C1eFDcC9
ExplorerToken (代币合约): 0x7528A496E0C212fcA3263D272a04309a2330FfC6
```

**2. 网络配置**
```
网络: OP Sepolia
Chain ID: 11155420
RPC: https://api.zan.top/opt-sepolia
```

**3. 代币价格**
```
所有代币统一价格: 0.0000001 ETH
```

### 前端主要需要实现的功能

✅ **必需功能**
1. 连接 MetaMask 钱包
2. 切换到 OP Sepolia 网络
3. 显示用户代币余额（POWER, OIL, EXPLORER）
4. 购买代币界面
5. 显示交易状态和结果

✅ **推荐功能**
6. 显示用户 ETH 余额
7. 显示代币价格
8. 计算总价
9. 错误处理和友好提示
10. 交易历史/区块浏览器链接

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
# 1. 复制这 4 个文件到你的项目
cp ExplorerToken.abi.json /your-project/src/
cp Minter.abi.json /your-project/src/
cp contracts.config.js /your-project/src/  # 或 .ts

# 2. 安装依赖
npm install ethers@6

# 3. 在代码中导入
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config';
import MinterABI from './Minter.abi.json';
```

## 💡 常用代码片段

### 连接钱包
```javascript
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();
```

### 查询余额
```javascript
import TokenABI from './ExplorerToken.abi.json';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config';

const token = new ethers.Contract(
  CONTRACT_ADDRESSES.ExplorerToken,
  TokenABI,
  signer
);

const balance = await token.balanceOf(userAddress, TOKEN_IDS.POWER);
```

### 购买代币
```javascript
import MinterABI from './Minter.abi.json';

const minter = new ethers.Contract(
  CONTRACT_ADDRESSES.Minter,
  MinterABI,
  signer
);

// 购买 10 个 POWER
const tx = await minter.buy(
  1,           // TOKEN_POWER
  10,          // 数量
  userAddress, // 接收地址
  { value: '1000000000000' } // 0.000001 ETH (10 * 0.0000001)
);

await tx.wait(); // 等待确认
```

## 🔍 快速检查清单

在开始开发前，确保：
- [ ] 已安装 MetaMask 浏览器插件
- [ ] 已获取 OP Sepolia 测试 ETH（[水龙头](https://www.alchemy.com/faucets/optimism-sepolia)）
- [ ] 已复制必需的 4 个文件
- [ ] 已安装 ethers.js 或 viem
- [ ] 已查看 example.html 了解基本流程

## 📞 获取帮助

按优先级查看文档：
1. **快速问题**: 查看 [QUICK_START.md](QUICK_START.md) 的常见问题部分
2. **代码示例**: 查看 [example.html](example.html) 的源代码
3. **详细文档**: 查看 [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md)
4. **合约源码**: 查看项目 `src/` 目录

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

## 🌐 重要链接

| 资源 | URL |
|------|-----|
| OP Sepolia 浏览器 | https://sepolia-optimism.etherscan.io |
| ExplorerToken 合约 | https://sepolia-optimism.etherscan.io/address/0x7528A496E0C212fcA3263D272a04309a2330FfC6 |
| Minter 合约 | https://sepolia-optimism.etherscan.io/address/0x26F87856E62f2F72feD55938972684c2C1eFDcC9 |
| OP Sepolia 水龙头 | https://www.alchemy.com/faucets/optimism-sepolia |

## 📊 合约测试状态

所有合约已在 OP Sepolia 测试网部署并测试通过：

✅ 部署成功
✅ 单个购买测试通过（1 个代币）
✅ 批量购买测试通过（10 个代币）
✅ 钱包上限保护测试通过（1001 个正确拒绝）
✅ 价格配置正确（0.0000001 ETH）
✅ 白名单功能正常

详见: [TEST_REPORT.md](../TEST_REPORT.md)

---

## 🎯 下一步

1. **如果是第一次接触**: 打开 `example.html` 试试看
2. **如果要集成到项目**: 看 `QUICK_START.md`
3. **如果需要详细文档**: 看 `FRONTEND_INTEGRATION.md`
4. **如果遇到问题**: 查看各文档的"常见问题"部分

**祝开发顺利！** 🚀
