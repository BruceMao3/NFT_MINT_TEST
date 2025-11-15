# Trust Wallet 冲突问题解决方案

## 🎯 问题描述

当同时安装 MetaMask 和 Trust Wallet 扩展时，即使我们在应用中选择 MetaMask，Trust Wallet 仍然会弹出。

## 🔧 已实施的解决方案

### 1. EIP-6963 钱包发现标准

我们现在使用 **EIP-6963** 标准来发现和连接钱包。这是现代浏览器钱包的推荐标准，可以更好地处理多钱包环境。

**工作原理：**
- 应用通过 `eip6963:requestProvider` 事件请求钱包声明
- 每个钱包扩展通过 `eip6963:announceProvider` 事件响应
- 应用可以明确地选择特定钱包，而不依赖 `window.ethereum`

**优势：**
- ✅ 避免钱包之间的冲突
- ✅ 精确识别每个钱包（通过 RDNS）
- ✅ 不受钱包注入顺序影响

### 2. 多层级 Provider 检测

代码现在使用 4 种方法来查找 MetaMask：

```
Method 1: EIP-6963 发现 (最可靠)
   ↓ 失败
Method 2: window.ethereum.providers 数组
   ↓ 失败
Method 3: window.ethereum 直接检查
   ↓ 失败
Method 4: 返回错误
```

### 3. Trust Wallet 过滤

在 `window.ethereum.providers` 数组中，我们现在明确过滤掉 Trust Wallet：

```typescript
const metamaskProvider = window.ethereum.providers.find(
  (p: any) => p.isMetaMask === true && !(p as any).isTrust
);
```

## 🐛 为什么 Trust Wallet 仍然会弹出？

即使我们正确找到了 MetaMask provider，Trust Wallet 可能仍然弹出，原因可能是：

### 原因 1: 浏览器级别的钱包选择器

一些现代浏览器（如 Chrome）在检测到多个钱包扩展时，会显示自己的钱包选择器。即使我们在代码中选择了 MetaMask，**浏览器仍然会让用户选择**。

**表现：**
- 点击 MetaMask 后，浏览器显示钱包选择弹窗
- 用户必须在浏览器弹窗中再次选择 MetaMask

### 原因 2: Trust Wallet 的扩展优先级

Trust Wallet 可能设置了更高的扩展优先级，导致它拦截了所有的 `eth_requestAccounts` 请求。

**表现：**
- Trust Wallet 直接弹出，没有经过浏览器选择器
- MetaMask 完全不可见

### 原因 3: 钱包版本不支持 EIP-6963

如果钱包扩展版本较旧，可能不支持 EIP-6963 标准，导致回退到旧的注入方法。

**表现：**
- 控制台显示 "No EIP-6963 compatible wallets found"
- 多个钱包竞争 `window.ethereum`

## ✅ 解决方案

### 方案 A: 临时禁用 Trust Wallet 扩展（推荐用于测试）

这是最简单直接的方法：

1. **在 Chrome/Edge 中：**
   ```
   1. 访问: chrome://extensions/
   2. 找到 Trust Wallet
   3. 点击关闭开关
   4. 刷新应用页面
   5. 现在只有 MetaMask 会响应
   ```

2. **在 Firefox 中：**
   ```
   1. 访问: about:addons
   2. 找到 Trust Wallet
   3. 点击禁用
   4. 刷新应用页面
   ```

### 方案 B: 更新钱包扩展到最新版本

确保两个钱包都支持 EIP-6963：

1. **更新 MetaMask：**
   - 打开 MetaMask
   - 设置 → 关于 → 检查更新
   - 需要 v11.0+ 才完全支持 EIP-6963

2. **更新 Trust Wallet：**
   - 同样检查更新到最新版本

### 方案 C: 设置浏览器的默认钱包（Chrome）

在 Chrome 中，你可以设置默认钱包：

1. 访问: `chrome://settings/web3`
2. 在 "Default Ethereum wallet" 下选择 MetaMask
3. 这可能会减少钱包冲突

### 方案 D: 使用不同的浏览器配置文件

创建一个只安装 MetaMask 的独立浏览器配置文件：

1. **Chrome/Edge：**
   ```
   点击头像图标 → 添加 → 创建新配置文件
   在新配置文件中只安装 MetaMask
   ```

2. **Firefox：**
   ```
   about:profiles → 创建新配置文件
   在新配置文件中只安装 MetaMask
   ```

## 📊 调试步骤

部署新代码后，请收集以下信息：

### 1. 检查 EIP-6963 钱包发现

打开浏览器控制台，查找：

```
🔍 [EIP-6963] Starting wallet discovery...
📢 [EIP-6963] Wallet announced: MetaMask (io.metamask)
📢 [EIP-6963] Wallet announced: Trust Wallet (com.trustwallet.app)
✅ [EIP-6963] Discovery initialized
```

**关键问题：**
- ✅ 是否看到 MetaMask 被发现？
- ✅ RDNS 是否是 `io.metamask`？
- ⚠️ 有多少个钱包被发现？

### 2. 检查 MetaMask Provider 查找

点击 "Connect Wallet" → 选择 MetaMask 后，查看：

```
🔍 [getMetaMaskProvider] Searching for MetaMask...
✅ [EIP-6963] Found MetaMask: MetaMask
   RDNS: io.metamask
```

**如果看到：**
```
⚠️ [EIP-6963] MetaMask not found via EIP-6963
   Discovered wallets: ['com.trustwallet.app', ...]
```

这意味着 MetaMask 不支持 EIP-6963 或未被正确发现。

### 3. 观察实际弹出的钱包

**记录：**
- 哪个钱包弹出了？
- 是否有浏览器钱包选择器？
- 选择器中显示了哪些选项？

### 4. 检查错误信息

如果连接失败，查看错误：

```
❌ [connectMetaMask] MetaMask provider not found
```

或

```
MetaMask connection error: User rejected the request (code: 4001)
```

## 🎯 预期结果

### ✅ 成功场景

```
用户流程：
1. 点击 "Connect Wallet"
2. 选择 MetaMask 选项
3. 只有 MetaMask 弹出连接请求
4. 确认连接
5. 钱包连接成功

控制台日志：
🔍 [EIP-6963] Starting wallet discovery...
📢 [EIP-6963] Wallet announced: MetaMask (io.metamask)
✅ [EIP-6963] Found MetaMask: MetaMask
✅ [connectMetaMask] Accounts received: ["0x..."]
```

### ❌ 失败场景（需要进一步修复）

```
用户流程：
1. 点击 "Connect Wallet"
2. 选择 MetaMask 选项
3. Trust Wallet 或浏览器选择器弹出
4. 用户困惑 ❌

可能的原因：
- 钱包版本不支持 EIP-6963
- 浏览器拦截并显示自己的选择器
- Trust Wallet 扩展设置了更高优先级
```

## 🔜 后续可能的改进

如果 EIP-6963 仍然无法解决问题，我们可以考虑：

1. **添加浏览器检测和警告**
   - 检测是否有多个钱包
   - 显示友好的提示信息
   - 引导用户禁用其他钱包

2. **实现钱包优先级设置**
   - 让用户在应用中选择默认钱包
   - 记住用户的选择

3. **使用 iframe 隔离**
   - 在隔离的 iframe 中连接钱包
   - 可能绕过某些钱包冲突

4. **直接使用 window.ethereum.request()**
   - 不通过任何封装，直接使用原生 API
   - 可能减少拦截的机会

## 📝 测试清单

部署后请测试：

- [ ] 应用加载时是否显示 EIP-6963 钱包发现日志
- [ ] 控制台是否显示找到的所有钱包
- [ ] 点击 MetaMask 选项后，控制台显示使用 EIP-6963 provider
- [ ] 实际弹出的是哪个钱包
- [ ] 是否有浏览器级别的钱包选择器
- [ ] 连接是否成功

## 💡 临时解决方案（如果仍然失败）

如果上述方案都无法解决问题，最可靠的方法是：

**在测试/使用应用时，临时禁用 Trust Wallet 扩展**

这样可以确保：
- ✅ 没有钱包冲突
- ✅ MetaMask 是唯一的 provider
- ✅ 应用功能正常工作

等 Trust Wallet 和 MetaMask 都完全支持 EIP-6963 后，这个问题会自然解决。

---

**更新内容：**
- ✅ 实现 EIP-6963 钱包发现
- ✅ 增强 MetaMask provider 检测
- ✅ 添加 Trust Wallet 过滤
- ✅ 详细的诊断日志
- ✅ 多层级回退机制

**测试目标：**
确认 EIP-6963 是否能正确发现和连接 MetaMask，不受 Trust Wallet 干扰。

