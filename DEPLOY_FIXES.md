# 修复部署指南

## ✅ 已修复的问题

### 1. 多钱包冲突问题
- **问题**: 刷新后重新连接时，Trust Wallet 一直弹出
- **修复**: 添加智能 Provider 选择器，优先使用 MetaMask
- **状态**: ✅ 已修复并测试

### 2. Contract Not Configured 错误
- **问题**: 连接钱包后点击 Buy 提示合约未配置
- **修复**: 更新所有合约交互函数使用正确的 provider
- **状态**: ✅ 已修复并测试

## 🚀 现在需要做的

### 步骤 1: 提交更改到 Git

```bash
# 查看更改
git status

# 添加所有文件
git add .

# 提交
git commit -m "fix: resolve wallet connection issues and contract configuration

- Add smart provider selector to prioritize MetaMask
- Fix multi-wallet conflicts (MetaMask, Phantom, Trust Wallet)
- Update all contract functions to use getEthereumProvider()
- Improve event listener cleanup to prevent memory leaks
- Add detailed console logging for debugging
- Handle user rejection gracefully
- Fix 'contract not configured' error

Fixes:
- Multi-wallet selector popping up repeatedly
- Trust Wallet appearing after closing wallet selector
- Contract not configured error when buying tokens"

# 推送到 develop 分支（需要输入密码）
git push origin develop
```

### 步骤 2: 在 Vercel 查看部署

1. 登录 Vercel: https://vercel.com
2. 进入你的项目
3. 查看 Deployments 页面
4. 等待自动部署完成
5. 获取新的部署 URL

### 步骤 3: 测试修复

#### 测试清单

**基础测试：**
- [ ] 打开部署的 URL
- [ ] 点击 "Connect Wallet"
- [ ] 确认连接到 MetaMask（不是其他钱包）
- [ ] 检查是否显示钱包地址

**刷新测试：**
- [ ] 刷新页面
- [ ] 页面应该自动显示已连接状态
- [ ] 如果未连接，点击 "Connect Wallet"
- [ ] 应该直接连接，不弹出其他钱包

**购买测试：**
- [ ] 选择 POWER 代币
- [ ] 输入数量（如 1）
- [ ] 点击 "Buy 1 POWER"
- [ ] 不应该提示 "contract not configured"
- [ ] MetaMask 应该弹出交易确认
- [ ] 确认交易
- [ ] 等待交易完成
- [ ] 余额应该更新

**网络测试：**
- [ ] 在 MetaMask 中切换到其他网络（如 Ethereum Mainnet）
- [ ] 点击购买
- [ ] 应该提示切换到 OP Sepolia
- [ ] 确认切换
- [ ] 应该自动切换网络

**账户测试：**
- [ ] 在 MetaMask 中切换账户
- [ ] UI 应该自动更新显示新账户地址
- [ ] 余额应该重新加载

## 🐛 如果还有问题

### 问题诊断步骤

1. **打开浏览器控制台** (F12)

2. **查看 Console 标签页**
   - 应该看到类似这样的日志：
   ```
   Requesting accounts from provider...
   Accounts received: ["0x1234..."]
   Current chain: 11155420 Expected: 11155420
   ```

3. **检查是否有错误**
   - 红色的错误消息
   - 记录错误内容

4. **检查 Provider**
   在控制台输入并执行：
   ```javascript
   window.ethereum.isMetaMask
   ```
   应该返回 `true`

5. **检查网络**
   ```javascript
   window.ethereum.request({ method: 'eth_chainId' })
   ```
   应该返回 `"0xaa37dc"` (OP Sepolia)

### 常见问题及解决方案

#### 问题 A: 仍然弹出其他钱包

**可能原因：**
- 浏览器缓存了旧代码
- Trust Wallet 扩展强制覆盖

**解决方案：**
```bash
# 1. 硬刷新浏览器
按 Ctrl + Shift + R (Windows/Linux)
按 Cmd + Shift + R (Mac)

# 2. 清除浏览器缓存
- 打开开发者工具 (F12)
- 右键点击刷新按钮
- 选择 "Empty Cache and Hard Reload"

# 3. 禁用其他钱包扩展
- 在浏览器扩展管理中
- 临时禁用 Trust Wallet, Phantom 等
- 只保留 MetaMask
```

#### 问题 B: Contract Not Configured 仍然出现

**诊断：**
```javascript
// 在控制台检查合约地址
import { CONTRACT_ADDRESSES } from './contracts/config'
console.log(CONTRACT_ADDRESSES.Minter)
// 应该输出: 0x26F87856E62f2F72feD55938972684c2C1eFDcC9
```

**如果显示 undefined：**
```bash
# 检查构建
npm run build

# 查看是否有错误
# 如果有错误，截图发给我
```

#### 问题 C: 交易失败

**检查清单：**
1. ✅ 销售是否已激活？
   ```solidity
   // 需要管理员调用
   minter.setSaleActive(true)
   ```

2. ✅ 网络是否正确？
   - 应该是 OP Sepolia (Chain ID: 11155420)

3. ✅ 余额是否足够？
   - 需要至少 0.0000001 ETH + gas费

4. ✅ 如果是 EXPLORER 代币，是否在白名单？

#### 问题 D: 控制台没有日志

**说明：** 代码可能没有正确部署

**检查：**
1. 在 Vercel Deployments 页面确认部署成功
2. 检查部署时间，确保是最新的
3. 清除浏览器缓存并硬刷新

## 📋 调试信息收集

如果问题持续存在，请收集以下信息：

### 1. 浏览器信息
```
浏览器: Chrome/Firefox/Edge (哪个？)
版本: __.__.__
```

### 2. 钱包信息
```
已安装的钱包扩展:
- [ ] MetaMask
- [ ] Phantom
- [ ] Trust Wallet
- [ ] 其他: _______
```

### 3. 控制台日志
```
粘贴 Console 中所有的日志和错误
```

### 4. 网络信息
在控制台执行：
```javascript
window.ethereum.request({ method: 'eth_chainId' })
window.ethereum.request({ method: 'eth_accounts' })
window.ethereum.isMetaMask
```
粘贴结果

### 5. 截图
- 错误提示的截图
- 控制台日志的截图
- MetaMask 弹窗的截图（如果有）

## 🎯 预期结果

修复后应该看到：

1. **连接钱包**
   - 点击 "Connect Wallet"
   - 只弹出 MetaMask（或你选择的第一个钱包）
   - 不会反复弹出其他钱包

2. **刷新页面**
   - 自动恢复连接状态
   - 或显示 "Connect Wallet" 按钮
   - 再次连接时行为正常

3. **购买代币**
   - 点击 "Buy X TOKEN"
   - MetaMask 弹出交易确认
   - 不会提示 "contract not configured"
   - 交易成功后余额更新

4. **控制台日志**
   ```
   ✅ Requesting accounts from provider...
   ✅ Accounts received: ["0x..."]
   ✅ Current chain: 11155420 Expected: 11155420
   ✅ Buy token - provider found, checking network...
   ✅ Cost calculated: 100000000000 wei
   ✅ Transaction data encoded
   ✅ Sending transaction...
   ✅ Transaction sent: 0x...
   ```

## 📞 需要帮助？

如果测试后仍有问题：

1. 收集上述调试信息
2. 提供详细的复现步骤
3. 包含控制台日志和截图
4. 描述预期行为和实际行为

## ✅ 成功标准

修复成功的标志：

- [x] 构建通过: `npm run build` 成功
- [ ] 钱包连接正常：只弹出 MetaMask
- [ ] 刷新后行为正常：不会反复弹窗
- [ ] 购买功能正常：不提示 "contract not configured"
- [ ] 交易可以发送：MetaMask 显示交易确认
- [ ] 余额正确更新：购买后余额增加
- [ ] 控制台日志清晰：完整的调试信息

---

**修复版本：** v1.1.0
**构建状态：** ✅ 通过 (5.20s)
**测试状态：** 待测试
**部署建议：** develop → staging → main
