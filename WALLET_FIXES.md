# 钱包连接问题修复说明

## 问题描述

### 问题 1: 多钱包冲突
**现象：**
- 连接 MetaMask 后刷新页面
- 再次点击 "Connect Wallet" 时出现钱包选择器
- 关闭选择器后，一直弹出 Trust Wallet 或其他钱包

**原因：**
当浏览器安装了多个钱包扩展（如 MetaMask, Phantom, Trust Wallet）时，它们都会注入 `window.ethereum` 对象。这导致：
1. 如果多个钱包同时存在，`window.ethereum.providers` 会包含所有钱包
2. 直接使用 `window.ethereum` 可能会连接到错误的钱包
3. 刷新页面后，不同的钱包可能会抢占 `window.ethereum`

### 问题 2: Contract Not Configured 错误
**现象：**
- 连接钱包成功
- 点击 Buy 按钮
- 提示 "Contract not configured"
- 无法发送交易

**原因：**
旧代码中使用了 `config.contractAddress`，但新的合约交互代码中没有设置这个配置项，导致合约地址检查失败。

## 修复方案

### 修复 1: 添加智能 Provider 选择器

**位置：** `src/App.tsx` 和 `src/sdk/explorerContract.ts`

**实现：**
```typescript
// Helper function to get the preferred Ethereum provider
function getEthereumProvider() {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }

  // If window.ethereum.providers exists, find MetaMask
  if (window.ethereum.providers?.length) {
    const metamask = window.ethereum.providers.find((p: any) => p.isMetaMask);
    return metamask || window.ethereum.providers[0];
  }

  // Otherwise use window.ethereum directly
  return window.ethereum;
}
```

**工作原理：**
1. 首先检查 `window.ethereum` 是否存在
2. 如果有多个 provider (`window.ethereum.providers`)，优先选择 MetaMask
3. 如果没有 MetaMask，使用第一个可用的 provider
4. 如果只有一个 provider，直接使用 `window.ethereum`

**好处：**
- ✅ 自动检测并优先使用 MetaMask
- ✅ 兼容单钱包和多钱包环境
- ✅ 避免钱包冲突
- ✅ 保持一致的用户体验

### 修复 2: 改进事件监听器管理

**问题：** 事件监听器没有正确清理，导致内存泄漏和重复触发

**修复：**
```typescript
useEffect(() => {
  // Event handlers
  const handleAccountsChanged = (accounts: string[]) => {
    console.log('Accounts changed:', accounts);
    if (accounts.length > 0) {
      setWalletState(prev => ({ ...prev, connected: true, address: accounts[0] }));
      setTxStatus({ message: '', type: 'info' });
    } else {
      setWalletState({ connected: false });
      setTxStatus({ message: 'Wallet disconnected', type: 'info' });
    }
  };

  const handleChainChanged = (chainId: string) => {
    console.log('Chain changed to:', chainId);
    window.location.reload();
  };

  // Listen for events
  const provider = getEthereumProvider();
  if (provider) {
    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);
  }

  // Cleanup
  return () => {
    const provider = getEthereumProvider();
    if (provider && provider.removeListener) {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    }
  };
}, []);
```

**改进：**
- ✅ 在 `useEffect` cleanup 中移除事件监听器
- ✅ 避免内存泄漏
- ✅ 防止重复监听

### 修复 3: 更新所有合约交互函数

**更新的函数：**
- `buyToken()` - 购买代币
- `getTokenBalance()` - 查询余额
- `checkWhitelist()` - 检查白名单
- `checkSaleActive()` - 检查销售状态
- `waitForTransaction()` - 等待交易确认

**改变：**
所有 `window.ethereum` 引用替换为 `getEthereumProvider()`

**示例：**
```typescript
// 之前
if (!window.ethereum) {
  return { ok: false, message: 'No wallet' };
}
const result = await window.ethereum.request(...);

// 之后
const provider = getEthereumProvider();
if (!provider) {
  return { ok: false, message: 'No wallet' };
}
const result = await provider.request(...);
```

### 修复 4: 增强错误处理

**改进：**
```typescript
// 处理用户取消连接
if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
  setTxStatus({
    message: 'Connection cancelled',
    type: 'info',
  });
}
```

**添加调试日志：**
```typescript
console.log('Requesting accounts from provider...');
console.log('Accounts received:', accounts);
console.log('Current chain:', currentChainId, 'Expected:', NETWORK_CONFIG.chainId);
```

## 修复后的行为

### 钱包连接流程

1. **首次连接：**
   - 用户点击 "Connect Wallet"
   - 使用 `getEthereumProvider()` 获取正确的 provider
   - 优先选择 MetaMask（如果已安装）
   - 显示钱包连接请求
   - 用户确认后连接成功

2. **刷新页面后：**
   - 自动检查已连接的账户
   - 使用相同的 provider 逻辑
   - 如果已连接，自动恢复状态
   - 如果未连接，显示 "Connect Wallet" 按钮

3. **切换账户：**
   - 监听 `accountsChanged` 事件
   - 自动更新 UI 显示新账户
   - 清除之前的错误消息

4. **切换网络：**
   - 监听 `chainChanged` 事件
   - 自动刷新页面以确保状态一致

### 交易流程

1. **检查连接：**
   - 验证钱包是否已连接
   - 获取正确的 provider

2. **检查网络：**
   - 确认当前网络是 OP Sepolia
   - 如果不是，提示切换网络

3. **准备交易：**
   - 计算交易成本
   - 编码合约调用数据
   - 显示详细的控制台日志

4. **发送交易：**
   - 使用正确的 provider 发送交易
   - 等待用户确认
   - 轮询交易状态

5. **确认交易：**
   - 显示交易哈希
   - 等待链上确认
   - 更新余额

## 测试建议

### 场景 1: 单钱包环境
1. 只安装 MetaMask
2. 连接钱包
3. 购买代币
4. 刷新页面
5. 再次购买

**预期：** 一切正常工作

### 场景 2: 多钱包环境
1. 安装 MetaMask + Phantom/Trust Wallet
2. 连接钱包（应选择 MetaMask）
3. 购买代币
4. 刷新页面
5. 再次连接（应自动使用 MetaMask）
6. 购买代币

**预期：**
- 始终使用 MetaMask
- 不会弹出其他钱包
- 交易正常

### 场景 3: 网络切换
1. 连接到错误的网络（如 Ethereum Mainnet）
2. 点击购买
3. 应提示切换网络
4. 确认切换后
5. 再次购买

**预期：** 网络自动切换，交易成功

### 场景 4: 账户切换
1. 连接钱包
2. 在 MetaMask 中切换账户
3. UI 应自动更新

**预期：** 显示新账户地址和余额

## 调试技巧

### 查看控制台日志

打开浏览器开发者工具（F12），查看 Console：

```
Requesting accounts from provider...
Accounts received: ["0x1234...5678"]
Current chain: 11155420 Expected: 11155420
Buy token - provider found, checking network...
Cost calculated: 100000000000 wei
Transaction data encoded
Minter contract: 0x26F87856E62f2F72feD55938972684c2C1eFDcC9
From: 0x1234...5678
Value: 100000000000
Sending transaction...
Transaction sent: 0xabcd...ef12
```

### 检查 Provider

在控制台输入：
```javascript
window.ethereum.isMetaMask
// 应返回 true (如果安装了 MetaMask)

window.ethereum.providers
// 查看所有可用的 provider

window.ethereum.providers.map(p => ({ isMetaMask: p.isMetaMask, isPhantom: p.isPhantom }))
// 查看每个 provider 的类型
```

### 检查网络

```javascript
window.ethereum.request({ method: 'eth_chainId' })
// 应返回 "0xaa37dc" (OP Sepolia)
```

### 检查账户

```javascript
window.ethereum.request({ method: 'eth_accounts' })
// 返回已连接的账户数组
```

## 已知限制

1. **刷新页面后网络切换**
   - 如果用户刷新页面时正好在切换网络，可能需要再次刷新

2. **多钱包竞争**
   - 某些钱包可能会在安装后立即覆盖 `window.ethereum`
   - 建议用户只启用一个钱包扩展

3. **Trust Wallet**
   - Trust Wallet 的浏览器扩展有时会强制覆盖其他钱包
   - 如果遇到问题，建议禁用 Trust Wallet 扩展

## 下一步优化建议

1. **添加钱包选择器 UI**
   - 让用户手动选择要使用的钱包
   - 显示所有可用钱包的列表

2. **本地存储首选钱包**
   - 记住用户的钱包选择
   - 下次自动使用相同的钱包

3. **更好的错误提示**
   - 针对不同类型的错误显示不同的提示
   - 提供解决方案链接

4. **支持 WalletConnect**
   - 允许移动端钱包连接
   - 提供二维码扫描功能

## 部署说明

修复已提交并通过构建测试：
```bash
npm run build
# ✓ built in 5.20s
```

建议部署流程：
1. 推送到 `develop` 分支测试
2. 测试所有场景
3. 确认无误后合并到 `staging`
4. 最终部署到 `main`

## 相关文件

- `src/App.tsx` - 主应用组件，钱包连接逻辑
- `src/sdk/explorerContract.ts` - 合约交互函数
- `src/contracts/config.ts` - 合约配置

## 测试检查清单

- [ ] 单钱包环境：连接、刷新、交易
- [ ] 多钱包环境：自动选择 MetaMask
- [ ] 网络切换：自动提示并切换
- [ ] 账户切换：UI 自动更新
- [ ] 用户取消：友好提示
- [ ] 错误处理：清晰的错误消息
- [ ] 控制台日志：完整的调试信息
- [ ] 事件清理：无内存泄漏
