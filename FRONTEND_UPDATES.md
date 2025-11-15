# 前端更新说明

本文档说明了为适配已部署的 Explorer Protocol 合约而进行的前端代码更新。

## 更新概览

已成功将前端从简单的 NFT Mint 应用更新为支持 ERC1155 多代币购买的应用。

## 主要更新

### 1. 新增文件

#### `src/contracts/` 目录
- **`config.ts`** - 合约配置文件（从 frontend-exports 复制）
  - 包含网络配置 (OP Sepolia)
  - 合约地址（Minter, ExplorerToken, Treasury）
  - 代币配置（POWER, OIL, EXPLORER）
  - 工具函数（价格计算、错误解析等）

- **`Minter.abi.json`** - Minter 合约 ABI
- **`ExplorerToken.abi.json`** - ExplorerToken 合约 ABI

#### SDK 模块
- **`src/sdk/explorerContract.ts`** - 新的合约交互模块
  - `buyToken()` - 购买代币
  - `getTokenBalance()` - 查询代币余额
  - `checkWhitelist()` - 检查白名单状态
  - `checkSaleActive()` - 检查销售状态

### 2. 更新的文件

#### `.env`
完全重写以支持 OP Sepolia 测试网：
```env
VITE_CHAIN_ID=11155420
VITE_RPC_URL=https://sepolia.optimism.io
VITE_MINTER_CONTRACT=0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT=0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT=0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_TEST_MODE=false
```

#### `src/App.tsx`
完全重写的用户界面：
- **代币选择** - 支持在 POWER、OIL、EXPLORER 之间切换
- **数量选择** - 可以选择购买数量
- **白名单显示** - 显示用户是否在白名单中
- **余额显示** - 实时显示每种代币的余额
- **销售状态** - 显示销售是否激活
- **网络自动切换** - 自动提示并切换到 OP Sepolia

#### `src/App.css`
新增样式：
- 代币卡片样式 (`.token-card`)
- 选中状态 (`.token-card.selected`)
- 数量输入框 (`.amount-input`)
- 销售状态指示器 (`.status-active`, `.status-inactive`)
- 白名单徽章 (`.whitelist-badge`)
- 区块浏览器链接 (`.explorer-links`)

### 3. 技术实现

#### 使用 viem 进行合约交互
```typescript
import { encodeFunctionData } from 'viem';

// 编码函数调用
const data = encodeFunctionData({
  abi: MinterABI,
  functionName: 'buy',
  args: [BigInt(tokenId), BigInt(amount), address as `0x${string}`],
});
```

#### 网络检测与切换
```typescript
// 检查当前网络
const chainId = await window.ethereum.request({ method: 'eth_chainId' });

// 切换网络
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: NETWORK_CONFIG.chainIdHex }],
});

// 如果网络不存在，添加网络
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: NETWORK_CONFIG.chainIdHex,
    chainName: NETWORK_CONFIG.chainName,
    nativeCurrency: NETWORK_CONFIG.nativeCurrency,
    rpcUrls: [NETWORK_CONFIG.publicRpcUrl],
    blockExplorerUrls: [NETWORK_CONFIG.blockExplorer],
  }],
});
```

#### 实时余额查询
```typescript
// 查询每种代币的余额
for (const tokenId of [TOKEN_IDS.POWER, TOKEN_IDS.OIL, TOKEN_IDS.EXPLORER]) {
  const balanceResult = await getTokenBalance(address, tokenId);
  if (balanceResult.ok) {
    setBalances(prev => ({ ...prev, [tokenId]: balanceResult.data }));
  }
}
```

## UI/UX 改进

### 之前
- 单一 NFT Mint 按钮
- 固定价格
- 简单的成功/失败提示

### 现在
- **多代币选择** - 可视化的代币卡片
- **动态价格计算** - 根据数量实时计算总价
- **白名单提示** - 清晰显示哪些代币需要白名单
- **余额跟踪** - 购买后自动更新余额
- **销售状态** - 实时显示销售是否激活
- **网络管理** - 自动检测并提示切换网络
- **交易链接** - 直接链接到区块浏览器

## 功能特性

### ✅ 已实现
- [x] 钱包连接（MetaMask）
- [x] 网络检测与自动切换到 OP Sepolia
- [x] 多代币选择（POWER, OIL, EXPLORER）
- [x] 数量选择
- [x] 实时价格计算
- [x] 白名单检查
- [x] 代币余额查询
- [x] 销售状态检查
- [x] 购买交易
- [x] 交易确认等待
- [x] 错误处理和友好提示
- [x] 区块浏览器链接
- [x] 响应式设计

### 🔄 待优化
- [ ] 后端 API 集成（目前仅前端）
- [ ] 交易历史记录
- [ ] 批量购买
- [ ] 价格变动监听
- [ ] 供应量显示
- [ ] WalletConnect 支持
- [ ] 多语言支持

## 代币配置

### POWER (ID: 1)
- 价格: 0.0000001 ETH
- 最大供应: 3000
- 钱包上限: 1000
- 白名单: 不需要
- 描述: 基础资源代币

### OIL (ID: 2)
- 价格: 0.0000001 ETH
- 最大供应: 3000
- 钱包上限: 1000
- 白名单: 不需要
- 描述: 基础资源代币

### EXPLORER (ID: 3)
- 价格: 0.0000001 ETH
- 最大供应: 1000
- 钱包上限: 1000
- 白名单: **需要**
- 描述: 高级代币（需要白名单）

## 错误处理

应用现在能够优雅地处理以下错误：

1. **SaleClosed** - "Sale is not active"
2. **WrongTokenId** - "Invalid token ID"
3. **WrongETH** - "Incorrect payment amount"
4. **NotWhitelisted** - "Address is not whitelisted (required for EXPLORER token)"
5. **WalletCapExceeded** - "Wallet holding cap exceeded (max 1000 per token)"
6. **MaxSupplyExceeded** - "Maximum supply exceeded"
7. **InsufficientBalance** - "Insufficient balance to complete purchase"
8. **User Rejected** - "Transaction rejected by user"

## 测试建议

### 本地测试
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 功能测试清单
1. ✅ 钱包连接
2. ✅ 网络切换提示
3. ✅ 选择不同代币
4. ✅ 修改购买数量
5. ✅ 查看实时价格
6. ✅ 购买 POWER（无需白名单）
7. ✅ 购买 OIL（无需白名单）
8. ✅ 尝试购买 EXPLORER（检查白名单错误）
9. ✅ 添加白名单后购买 EXPLORER
10. ✅ 检查余额更新
11. ✅ 点击区块浏览器链接

## 部署清单

在部署到 Vercel 之前：

1. ✅ 确保所有环境变量已配置
2. ✅ 测试构建成功 (`npm run build`)
3. ✅ 确认 `VITE_TEST_MODE=false`
4. ⚠️ 确认销售已激活（调用 `setSaleActive(true)`）
5. ⚠️ 如果要测试 EXPLORER，添加测试地址到白名单
6. ✅ 准备测试钱包和 OP Sepolia ETH

## 下一步

1. **测试部署**
   - 推送到 develop 分支
   - 在 Vercel 预览 URL 上测试
   - 使用真实钱包测试完整流程

2. **合约管理**
   - 激活销售 (`setSaleActive(true)`)
   - 添加测试地址到白名单
   - 监控合约状态

3. **用户反馈**
   - 测试用户体验
   - 收集反馈
   - 优化 UI/UX

4. **生产准备**
   - 通过 staging 环境测试
   - 准备生产环境配置
   - 部署到 main 分支

## 参考资料

- **合约地址**: 查看 `src/contracts/config.ts`
- **ABI 文件**: `src/contracts/*.abi.json`
- **区块浏览器**: https://sepolia-optimism.etherscan.io
- **测试网水龙头**: https://www.alchemy.com/faucets/optimism-sepolia
- **Vercel 部署**: 参考 `VERCEL_SETUP.md`
