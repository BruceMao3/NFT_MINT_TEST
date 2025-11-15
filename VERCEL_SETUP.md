# Vercel 部署配置指南

本文档指导如何在 Vercel 上为不同分支配置不同的环境。

## 环境分支设置

### 1. 分支策略

- **main** - 生产环境
- **staging** - 预发环境
- **develop** - 开发环境

### 2. 创建分支（本地执行）

```bash
# 创建并切换到 develop 分支
git checkout -b develop

# 推送 develop 分支到远程
git push -u origin develop

# 切换回 main
git checkout main

# 创建并切换到 staging 分支
git checkout -b staging

# 推送 staging 分支到远程
git push -u origin staging

# 切换回 main
git checkout main
```

## Vercel 环境变量配置

在 Vercel 项目设置中，为不同环境配置以下环境变量：

### Production (main 分支)

进入 Vercel 项目 Settings > Environment Variables，添加以下变量并选择 **Production**：

```env
VITE_CHAIN_ID=11155420
VITE_RPC_URL=https://api.zan.top/opt-sepolia
VITE_API_BASE_URL=https://your-production-api.com
VITE_MINTER_CONTRACT=0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT=0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT=0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_POWER_PRICE=0.0000001
VITE_OIL_PRICE=0.0000001
VITE_EXPLORER_PRICE=0.0000001
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_BLOCK_EXPLORER_URL=https://sepolia-optimism.etherscan.io
VITE_TEST_MODE=false
```

### Preview - Staging (staging 分支)

添加以下变量并选择 **Preview** (可以指定 staging 分支)：

```env
VITE_CHAIN_ID=11155420
VITE_RPC_URL=https://api.zan.top/opt-sepolia
VITE_API_BASE_URL=https://your-staging-api.com
VITE_MINTER_CONTRACT=0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT=0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT=0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_POWER_PRICE=0.0000001
VITE_OIL_PRICE=0.0000001
VITE_EXPLORER_PRICE=0.0000001
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_BLOCK_EXPLORER_URL=https://sepolia-optimism.etherscan.io
VITE_TEST_MODE=false
```

### Development (develop 分支)

添加以下变量并选择 **Preview** (指定 develop 分支)：

```env
VITE_CHAIN_ID=11155420
VITE_RPC_URL=https://api.zan.top/opt-sepolia
VITE_API_BASE_URL=http://localhost:8080
VITE_MINTER_CONTRACT=0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT=0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT=0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_POWER_PRICE=0.0000001
VITE_OIL_PRICE=0.0000001
VITE_EXPLORER_PRICE=0.0000001
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_BLOCK_EXPLORER_URL=https://sepolia-optimism.etherscan.io
VITE_TEST_MODE=false
```

## Vercel 分支部署设置

1. 进入 Vercel 项目的 **Settings > Git**
2. 在 **Production Branch** 中设置为 `main`
3. 确保 **Automatically deploy Preview** 已启用，这样 staging 和 develop 分支推送时会自动部署

## 部署流程

### 开发环境 (develop)

```bash
# 切换到 develop 分支
git checkout develop

# 进行开发和修改
# ...

# 提交更改
git add .
git commit -m "你的提交信息"

# 推送到远程，触发 Vercel 自动部署
git push origin develop
```

Vercel 会自动部署到一个预览 URL，例如：
`https://your-project-git-develop-your-team.vercel.app`

### 预发环境 (staging)

```bash
# 从 develop 合并到 staging
git checkout staging
git merge develop

# 推送到远程
git push origin staging
```

Vercel 会自动部署到预览 URL，例如：
`https://your-project-git-staging-your-team.vercel.app`

### 生产环境 (main)

```bash
# 从 staging 合并到 main
git checkout main
git merge staging

# 推送到远程
git push origin main
```

Vercel 会自动部署到生产 URL：
`https://your-project.vercel.app`

## 当前合约配置

所有环境都使用相同的 OP Sepolia 测试网合约：

- **Minter Contract**: `0x26F87856E62f2F72feD55938972684c2C1eFDcC9`
- **ExplorerToken Contract**: `0x7528A496E0C212fcA3263D272a04309a2330FfC6`
- **Treasury Contract**: `0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233`

### 代币信息

1. **POWER (ID: 1)**
   - 价格: 0.0000001 ETH
   - 最大供应量: 3000
   - 无需白名单

2. **OIL (ID: 2)**
   - 价格: 0.0000001 ETH
   - 最大供应量: 3000
   - 无需白名单

3. **EXPLORER (ID: 3)**
   - 价格: 0.0000001 ETH
   - 最大供应量: 1000
   - **需要白名单**

## 测试前的准备

1. **准备测试钱包**
   - 安装 MetaMask 或其他 Web3 钱包
   - 添加 OP Sepolia 测试网
   - 获取测试 ETH：https://www.alchemy.com/faucets/optimism-sepolia

2. **激活销售**
   - 使用有 SALE_ADMIN_ROLE 的账户调用 `setSaleActive(true)`

3. **添加白名单（如果要测试 EXPLORER 代币）**
   - 使用有 WHITELIST_ADMIN_ROLE 的账户调用 `setWhitelist(address, true)`

## 测试流程

1. **测试钱包连接**
   - 点击 "Connect Wallet"
   - 确认 MetaMask 连接请求
   - 检查是否显示连接的地址

2. **测试网络切换**
   - 如果钱包不在 OP Sepolia，应该提示切换网络
   - 确认网络切换请求

3. **测试代币购买 (POWER/OIL)**
   - 选择 POWER 或 OIL 代币
   - 输入购买数量
   - 点击购买按钮
   - 确认 MetaMask 交易
   - 等待交易确认
   - 检查余额是否更新

4. **测试白名单代币 (EXPLORER)**
   - 如果地址未在白名单，应显示错误
   - 添加地址到白名单后再次尝试

5. **测试交易链接**
   - 点击区块浏览器链接
   - 确认能在 OP Sepolia Etherscan 上查看交易

## 故障排查

### 钱包连接失败
- 确认已安装 MetaMask
- 确认钱包已解锁
- 刷新页面重试

### 交易失败
- 检查钱包 ETH 余额是否足够
- 确认销售已激活 (`saleActive = true`)
- 如果是 EXPLORER，检查是否在白名单
- 检查是否超过钱包持有上限 (1000)

### 网络错误
- 确认连接到 OP Sepolia (Chain ID: 11155420)
- 检查 RPC URL 是否可用
- 尝试使用备用 RPC: `https://api.zan.top/opt-sepolia`

## 重要提示

⚠️ **注意**：
- 所有环境当前都连接到同一个测试网合约
- 如果需要隔离环境，需要为每个环境部署单独的合约
- `.env` 文件不会被 Git 提交，所有配置都在 Vercel 上
- 确保 `VITE_TEST_MODE=false` 以使用真实的合约交互
