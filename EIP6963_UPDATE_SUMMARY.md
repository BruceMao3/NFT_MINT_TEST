# EIP-6963 更新摘要

## 🎯 问题
Trust Wallet 在连接时被意外唤起，即使用户选择了 MetaMask。

## ✨ 解决方案
实现 **EIP-6963** 钱包发现标准，精确识别和连接 MetaMask。

## 🔑 关键改进

### 1. EIP-6963 钱包发现
```typescript
// 监听钱包声明
window.addEventListener('eip6963:announceProvider', (event) => {
  // 每个钱包会声明自己的 RDNS（如 io.metamask）
});

// 请求钱包声明
window.dispatchEvent(new Event('eip6963:requestProvider'));
```

**优势：**
- ✅ 通过 RDNS 精确识别钱包（`io.metamask`、`com.trustwallet.app`）
- ✅ 不受注入顺序影响
- ✅ 现代浏览器钱包推荐标准

### 2. 4 层级回退机制
```
1. EIP-6963 发现 (io.metamask) ← 最可靠
2. window.ethereum.providers 数组查找
3. window.ethereum 直接检查
4. 返回错误
```

### 3. Trust Wallet 过滤
```typescript
// 明确排除 Trust Wallet
const metamaskProvider = providers.find(
  p => p.isMetaMask === true && !p.isTrust
);
```

## 📊 预期日志

### 应用加载时
```
🔍 [EIP-6963] Starting wallet discovery...
📢 [EIP-6963] Wallet announced: MetaMask io.metamask
📢 [EIP-6963] Wallet announced: Trust Wallet com.trustwallet.app
✅ [EIP-6963] Discovery complete: 2 wallet(s) found
```

### 连接 MetaMask 时
```
🔍 [getMetaMaskProvider] Searching for MetaMask...
✅ [EIP-6963] Found MetaMask: MetaMask
   RDNS: io.metamask
✅ [connectMetaMask] MetaMask provider found
📞 [connectMetaMask] Requesting accounts...
```

## 🚀 部署命令

```bash
git add .
git commit -m "feat: implement EIP-6963 wallet discovery to fix Trust Wallet conflict"
git push origin develop
```

## 🔍 测试重点

部署后检查：

1. **EIP-6963 是否工作？**
   - 查看控制台是否显示 `📢 [EIP-6963] Wallet announced`
   - MetaMask 的 RDNS 应该是 `io.metamask`

2. **是否使用 EIP-6963 provider？**
   - 点击 Connect 后查看是否显示 `✅ [EIP-6963] Found MetaMask`

3. **实际弹出的钱包是？**
   - 理想情况：只有 MetaMask 弹出
   - 可能情况：浏览器钱包选择器弹出（需要手动选择 MetaMask）

## ⚠️ 如果仍然失败

### 场景 A: 钱包不支持 EIP-6963
```
⚠️ [EIP-6963] No wallets responded after 200ms
→ 钱包版本太旧，需要更新
```

**解决方案：**
- 更新 MetaMask 到 v11.0+
- 更新 Trust Wallet 到最新版本

### 场景 B: 浏览器钱包选择器
即使找到正确的 provider，浏览器可能仍显示钱包选择器。

**解决方案：**
- 在浏览器选择器中选择 MetaMask
- 或临时禁用 Trust Wallet 扩展

### 场景 C: Trust Wallet 优先级更高
Trust Wallet 扩展可能设置了更高优先级。

**解决方案：**
- 临时禁用 Trust Wallet 扩展：`chrome://extensions/`
- 使用独立的浏览器配置文件（只安装 MetaMask）

## 📁 修改的文件

- ✅ `src/utils/walletConnection.ts` - 实现 EIP-6963 + 4 层级回退
- ✅ `src/utils/walletDiagnostics.ts` - 添加 EIP-6963 诊断
- ✅ `DEBUG_DEPLOYMENT.md` - 更新调试指南
- ✅ `TRUST_WALLET_ISSUE_SOLUTION.md` - 详细解决方案文档

## 🎓 技术背景

**什么是 EIP-6963？**

EIP-6963 是以太坊改进提案，定义了浏览器钱包的标准发现机制：

- 每个钱包通过事件声明自己
- 钱包提供 RDNS（反向域名）作为唯一标识符
- 应用可以列出所有可用钱包并精确选择
- 避免 `window.ethereum` 竞争和覆盖问题

**参考：**
- [EIP-6963 规范](https://eips.ethereum.org/EIPS/eip-6963)
- MetaMask v11.0+ 支持
- Trust Wallet 最新版本支持

## ✅ 成功标准

部署成功的标志：

1. ✅ 控制台显示 EIP-6963 钱包发现
2. ✅ MetaMask 被识别为 `io.metamask`
3. ✅ 连接时使用 EIP-6963 provider
4. ✅ 只有 MetaMask 弹出（或浏览器选择器中可以选择 MetaMask）
5. ✅ 连接成功

---

**下一步：**
1. 部署到 Vercel
2. 收集控制台日志
3. 确认 EIP-6963 是否正常工作
4. 根据结果决定是否需要进一步调整

