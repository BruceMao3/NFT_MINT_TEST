# 快速部署指南

本指南帮助你快速将前端部署到 Vercel 并进行测试。

## 🚀 快速开始（5分钟）

### 1. 创建分支（本地执行）

```bash
# 确保在项目根目录
cd /mnt/c/users/mwb/desktop/NFT_MINT_TEST

# 创建 develop 分支
git checkout -b develop

# 推送到远程（需要输入密码）
git push -u origin develop

# 切换回 main
git checkout main

# 创建 staging 分支
git checkout -b staging

# 推送到远程（需要输入密码）
git push -u origin staging

# 切换回 main
git checkout main
```

### 2. 在 Vercel 上配置环境变量

#### 登录 Vercel
1. 访问 https://vercel.com
2. 登录你的账号
3. 进入你的项目

#### 配置环境变量
进入 **Settings > Environment Variables**，添加以下变量：

**为所有环境添加（选择 Production, Preview, Development）：**

```
VITE_CHAIN_ID = 11155420
VITE_RPC_URL = https://api.zan.top/opt-sepolia
VITE_MINTER_CONTRACT = 0x26F87856E62f2F72feD55938972684c2C1eFDcC9
VITE_TOKEN_CONTRACT = 0x7528A496E0C212fcA3263D272a04309a2330FfC6
VITE_TREASURY_CONTRACT = 0x3D876fAa90c8519c5d229f9eeFfE20AB96FB3233
VITE_POWER_PRICE = 0.0000001
VITE_OIL_PRICE = 0.0000001
VITE_EXPLORER_PRICE = 0.0000001
VITE_WALLETCONNECT_PROJECT_ID = demo_project_id
VITE_BLOCK_EXPLORER_URL = https://sepolia-optimism.etherscan.io
VITE_TEST_MODE = false
VITE_API_BASE_URL = http://localhost:8080
```

> 💡 **提示**：暂时所有环境使用相同配置，后续可以分别调整

### 3. 部署到 develop 环境测试

```bash
# 切换到 develop 分支
git checkout develop

# 查看当前状态
git status

# 添加所有更改
git add .

# 提交（可以修改提交信息）
git commit -m "Update frontend to support Explorer Protocol contracts"

# 推送到远程，触发 Vercel 部署（需要输入密码）
git push origin develop
```

### 4. 等待部署完成

1. 在 Vercel 的 Deployments 页面查看部署进度
2. 部署成功后，会得到一个预览 URL，类似：
   ```
   https://nft-mint-test-git-develop-your-team.vercel.app
   ```

## ✅ 测试清单

### 准备工作

1. **安装 MetaMask**
   - 访问 https://metamask.io
   - 安装浏览器扩展

2. **获取测试 ETH**
   - 访问 https://www.alchemy.com/faucets/optimism-sepolia
   - 输入你的钱包地址
   - 领取测试 ETH（可能需要注册）

3. **激活销售（需要管理员权限）**

   使用有 `SALE_ADMIN_ROLE` 的账户调用：
   ```solidity
   // 在 OP Sepolia Etherscan 上
   // 找到 Minter 合约：0x26F87856E62f2F72feD55938972684c2C1eFDcC9
   // Contract > Write Contract > setSaleActive
   setSaleActive(true)
   ```

### 功能测试

#### ✅ 测试 1: 钱包连接
1. 打开部署的 URL
2. 点击 "Connect Wallet"
3. 在 MetaMask 中确认连接
4. 应该显示你的钱包地址（0x1234...5678）

#### ✅ 测试 2: 网络自动切换
1. 如果你的 MetaMask 不在 OP Sepolia 网络
2. 应该自动弹出切换网络的提示
3. 确认切换
4. 网络应该切换到 "OP Sepolia"

#### ✅ 测试 3: 选择代币
1. 看到三个代币卡片：POWER, OIL, EXPLORER
2. 点击不同的卡片
3. 选中的卡片应该有蓝色边框
4. EXPLORER 卡片应该显示 "Whitelist Required"

#### ✅ 测试 4: 调整数量
1. 在数量输入框中输入数字（如 10）
2. 总价应该自动更新
3. 例如：10 × 0.0000001 ETH = 0.0000010 ETH

#### ✅ 测试 5: 购买 POWER 代币
1. 选择 POWER 代币
2. 输入数量（如 5）
3. 点击 "Buy 5 POWER"
4. 在 MetaMask 中确认交易
5. 等待交易确认（约 5-10 秒）
6. 应该显示 "Transaction successful! Hash: 0x..."
7. POWER 的余额应该更新显示 "Balance: 5"

#### ✅ 测试 6: 购买 OIL 代币
1. 选择 OIL 代币
2. 输入数量（如 3）
3. 点击购买并确认交易
4. 检查余额更新

#### ✅ 测试 7: 尝试购买 EXPLORER（无白名单）
1. 选择 EXPLORER 代币
2. 点击购买
3. 应该显示错误："You are not whitelisted for this token"

#### ✅ 测试 8: 添加白名单并购买 EXPLORER
1. 使用有 `WHITELIST_ADMIN_ROLE` 的账户调用：
   ```solidity
   // 在 Minter 合约上
   setWhitelist(你的地址, true)
   ```
2. 刷新页面
3. 应该看到 "Whitelisted" 徽章
4. 现在应该可以购买 EXPLORER 了

#### ✅ 测试 9: 查看区块浏览器
1. 点击 "View Minter Contract" 链接
2. 应该在新标签页打开 OP Sepolia Etherscan
3. 显示 Minter 合约详情

#### ✅ 测试 10: 检查交易记录
1. 在 MetaMask 中查看 Activity
2. 应该看到所有购买交易
3. 点击交易可以看到详情

## 🐛 常见问题

### 问题 1: 钱包连接失败
**解决方案：**
- 确认已安装 MetaMask
- 刷新页面
- 确认 MetaMask 已解锁

### 问题 2: 网络切换失败
**解决方案：**
- 手动在 MetaMask 中添加 OP Sepolia 网络
- 网络名称: OP Sepolia
- RPC URL: https://api.zan.top/opt-sepolia
- Fallback RPC: https://sepolia.optimism.io
- Chain ID: 11155420
- 货币符号: ETH
- 区块浏览器: https://sepolia-optimism.etherscan.io

### 问题 3: 交易失败 "Sale Inactive"
**解决方案：**
- 需要管理员调用 `setSaleActive(true)`
- 在 OP Sepolia Etherscan 上找到 Minter 合约
- 使用 Write Contract 功能

### 问题 4: 交易失败 "Not Whitelisted"
**解决方案：**
- 只有购买 EXPLORER (ID: 3) 需要白名单
- 购买 POWER 或 OIL 不需要白名单
- 如果要购买 EXPLORER，请管理员添加白名单

### 问题 5: 余额不显示
**解决方案：**
- 刷新页面
- 重新连接钱包
- 检查网络是否正确

### 问题 6: 交易一直 Pending
**解决方案：**
- OP Sepolia 测试网可能有延迟
- 通常 5-30 秒内会确认
- 在 Etherscan 上查看交易状态

## 📋 管理员操作清单

在用户开始测试之前，管理员需要完成：

### 1. 激活销售
```solidity
// 连接到 Minter 合约
// 0x26F87856E62f2F72feD55938972684c2C1eFDcC9
minter.setSaleActive(true)
```

### 2. 添加测试白名单（可选）
```solidity
// 单个地址
minter.setWhitelist(0xTestAddress, true)

// 批量添加
address[] memory users = [0xAddr1, 0xAddr2, 0xAddr3];
minter.setWhitelistBatch(users, true)
```

### 3. 检查合约状态
```solidity
// 检查销售状态
minter.saleActive() // 应该返回 true

// 检查代币价格
minter.priceWei(1) // POWER, 应该返回 100000000000
minter.priceWei(2) // OIL, 应该返回 100000000000
minter.priceWei(3) // EXPLORER, 应该返回 100000000000

// 检查白名单
minter.isWhitelisted(0xTestAddress)
```

## 🎯 下一步

测试成功后：

1. **部署到 Staging**
   ```bash
   git checkout staging
   git merge develop
   git push origin staging
   ```

2. **部署到 Production**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

3. **监控和优化**
   - 收集用户反馈
   - 监控交易成功率
   - 优化 UI/UX

## 📞 需要帮助？

- **合约地址**: 查看 `src/contracts/config.ts`
- **详细文档**: 查看 `FRONTEND_UPDATES.md`
- **Vercel 配置**: 查看 `VERCEL_SETUP.md`
- **OP Sepolia Explorer**: https://sepolia-optimism.etherscan.io
- **测试网水龙头**: https://www.alchemy.com/faucets/optimism-sepolia

---

**祝部署顺利！** 🎉
