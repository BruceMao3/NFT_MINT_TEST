# 🚀 前端快速开始指南

## 📦 你需要给前端的所有信息

### 1️⃣ 必需文件（从本文件夹复制）

```
frontend-exports/
├── ExplorerToken.abi.json    # ExplorerToken 合约 ABI
├── Minter.abi.json           # Minter 合约 ABI
├── contracts.config.js       # JavaScript 配置文件
└── contracts.config.ts       # TypeScript 配置文件（可选）
```

### 2️⃣ 核心信息速查

**网络配置**
```
网络名称: OP Sepolia
Chain ID: 11155420 (0xaa37dc)
RPC URL: https://api.zan.top/opt-sepolia
浏览器: https://sepolia-optimism.etherscan.io
```

**合约地址（Proxy，前端只需要这些）**
```
ExplorerToken: 0x7528A496E0C212fcA3263D272a04309a2330FfC6
Minter:        0x26F87856E62f2F72feD55938972684c2C1eFDcC9
Treasury:      0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
```

**代币信息**
```
TOKEN_POWER (ID: 1)
- 价格: 0.0000001 ETH (100,000,000,000 wei)
- 最大供应: 3,000
- 钱包上限: 1,000
- 白名单: 不需要

TOKEN_OIL (ID: 2)
- 价格: 0.0000001 ETH (100,000,000,000 wei)
- 最大供应: 3,000
- 钱包上限: 1,000
- 白名单: 不需要

TOKEN_EXPLORER (ID: 3)
- 价格: 0.0000001 ETH (100,000,000,000 wei)
- 最大供应: 1,000
- 钱包上限: 1,000
- 白名单: 需要 ✅
```

## 🎯 最简单的集成方式

### 步骤 1: 复制文件
将以下文件复制到你的前端项目：
- `ExplorerToken.abi.json`
- `Minter.abi.json`
- `contracts.config.js` (或 `.ts`)

### 步骤 2: 安装依赖
```bash
npm install ethers@6
# 或
npm install viem
```

### 步骤 3: 使用示例代码

#### 使用 ethers.js
```javascript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, TOKEN_IDS } from './contracts.config.js';
import MinterABI from './Minter.abi.json';
import TokenABI from './ExplorerToken.abi.json';

// 连接钱包
const provider = new ethers.BrowserProvider(window.ethereum);
await provider.send("eth_requestAccounts", []);
const signer = await provider.getSigner();
const address = await signer.getAddress();

// 初始化合约
const minter = new ethers.Contract(CONTRACT_ADDRESSES.Minter, MinterABI, signer);
const token = new ethers.Contract(CONTRACT_ADDRESSES.ExplorerToken, TokenABI, signer);

// 查询余额
const balance = await token.balanceOf(address, TOKEN_IDS.POWER);
console.log('POWER 余额:', balance.toString());

// 购买代币
const amount = 10; // 购买数量
const price = await minter.priceWei(TOKEN_IDS.POWER);
const totalCost = price * BigInt(amount);

const tx = await minter.buy(
  TOKEN_IDS.POWER,  // 代币 ID
  amount,           // 数量
  address,          // 接收地址
  { value: totalCost } // 支付的 ETH
);

await tx.wait(); // 等待确认
console.log('购买成功!');
```

## 🔑 关键函数说明

### Minter 合约（购买）

**查询价格（只读）**
```javascript
const price = await minter.priceWei(tokenId);
// 返回: BigInt 类型的 wei 价格
```

**购买代币（需要发送 ETH）**
```javascript
await minter.buy(tokenId, amount, toAddress, { value: totalCost });
// tokenId: 1=POWER, 2=OIL, 3=EXPLORER
// amount: 购买数量
// toAddress: 接收地址（通常是用户自己）
// value: 总价 = price * amount
```

**检查白名单（只读）**
```javascript
const isWhitelisted = await minter.whitelist(userAddress);
// 返回: true 或 false
```

### ExplorerToken 合约（查询余额）

**查询单个余额（只读）**
```javascript
const balance = await token.balanceOf(address, tokenId);
// 返回: BigInt 类型的余额
```

**批量查询余额（只读）**
```javascript
const balances = await token.balanceOfBatch(
  [address, address, address],  // 地址数组
  [1, 2, 3]                      // 代币 ID 数组
);
// 返回: [powerBalance, oilBalance, explorerBalance]
```

## ⚠️ 常见问题

### Q1: 如何切换到 OP Sepolia 网络？
```javascript
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa37dc' }],
  });
} catch (error) {
  if (error.code === 4902) {
    // 网络不存在，添加网络
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0xaa37dc',
        chainName: 'OP Sepolia',
        nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
        rpcUrls: ['https://sepolia.optimism.io'],
        blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
      }]
    });
  }
}
```

### Q2: 为什么购买失败？

**错误 1: "WalletCapExceeded"**
- 原因: 超出钱包持有上限（每种代币最多 1000 个）
- 解决: 减少购买数量

**错误 2: "NotWhitelisted"**
- 原因: 购买 EXPLORER 代币需要白名单
- 解决: 只有管理员地址在白名单中，其他地址无法购买 EXPLORER

**错误 3: "WrongETH"**
- 原因: 支付金额不正确
- 解决: 确保 `value = price * amount`，必须精确匹配

**错误 4: "insufficient funds"**
- 原因: 钱包 ETH 余额不足
- 解决: 获取测试 ETH

### Q3: 如何获取 OP Sepolia 测试 ETH？
1. 访问: https://www.alchemy.com/faucets/optimism-sepolia
2. 输入你的地址
3. 领取测试 ETH

### Q4: 价格计算示例
```javascript
// 单价
const priceWei = 100000000000n; // 0.0000001 ETH

// 购买 1 个
const cost1 = priceWei * 1n;  // 100000000000 wei

// 购买 10 个
const cost10 = priceWei * 10n; // 1000000000000 wei

// 购买 100 个
const cost100 = priceWei * 100n; // 10000000000000 wei

// 转换为 ETH 显示
const ethAmount = ethers.formatEther(cost10);
console.log(ethAmount); // "0.000001"
```

### Q5: 如何监听购买事件？
```javascript
// 监听 Purchased 事件
minter.on('Purchased', (buyer, to, id, amount, paid, event) => {
  console.log('购买事件:', {
    buyer: buyer,
    tokenId: id.toString(),
    amount: amount.toString(),
    paid: ethers.formatEther(paid) + ' ETH',
    txHash: event.log.transactionHash
  });
});
```

## 📱 测试流程

1. **连接钱包**
   - 确保安装了 MetaMask
   - 点击连接按钮
   - 授权访问

2. **切换网络**
   - 切换到 OP Sepolia
   - 如果没有该网络，会自动添加

3. **查询余额**
   - 查看 POWER/OIL/EXPLORER 代币余额
   - 查看 ETH 余额

4. **购买代币**
   - 输入购买数量
   - 点击购买按钮
   - 确认交易
   - 等待区块确认

5. **验证结果**
   - 刷新余额，查看代币是否到账
   - 在区块浏览器查看交易

## 🧪 测试用例

建议前端测试以下场景：

✅ **基本功能**
- [ ] 连接 MetaMask
- [ ] 切换到 OP Sepolia 网络
- [ ] 显示用户地址和 ETH 余额
- [ ] 查询 POWER 代币余额
- [ ] 查询 OIL 代币余额
- [ ] 查询 EXPLORER 代币余额

✅ **购买功能**
- [ ] 购买 1 个 POWER 代币
- [ ] 购买 10 个 POWER 代币
- [ ] 购买 1 个 OIL 代币
- [ ] 购买 10 个 OIL 代币

✅ **错误处理**
- [ ] 余额不足时购买（应显示错误）
- [ ] 购买 1001 个（应显示超出上限错误）
- [ ] 用户取消交易（应正确处理）
- [ ] 非白名单地址购买 EXPLORER（应显示错误）

✅ **交互优化**
- [ ] 显示交易状态（pending/success/failed）
- [ ] 交易确认后自动刷新余额
- [ ] 显示交易哈希和浏览器链接
- [ ] 友好的错误提示

## 🎨 UI 建议

推荐显示的信息：
1. **钱包信息**: 地址（缩略）、ETH 余额
2. **代币卡片**: 代币名称、余额、价格、购买按钮
3. **购买表单**: 数量输入、总价显示、确认按钮
4. **交易状态**: 进行中/成功/失败
5. **错误提示**: 友好的错误消息
6. **交易记录**: 最近的购买记录（可选）

## 📚 更多资源

- **完整集成文档**: 查看 `FRONTEND_INTEGRATION.md`
- **示例页面**: 打开 `example.html` 查看完整示例
- **配置文件**: `contracts.config.js` 或 `contracts.config.ts`
- **ABI 文件**: `ExplorerToken.abi.json` 和 `Minter.abi.json`

## 🆘 需要帮助？

如果遇到问题：
1. 检查控制台错误信息
2. 确认网络是否正确 (Chain ID: 11155420)
3. 确认合约地址是否正确
4. 检查 ETH 余额是否足够
5. 查看交易详情：https://sepolia-optimism.etherscan.io

---

**祝开发顺利！** 🎉
