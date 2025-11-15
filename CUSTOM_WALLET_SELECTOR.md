# 自定义钱包选择器实现说明

## 问题背景

之前的实现中，直接使用 `window.ethereum.request()` 会触发浏览器内置的钱包选择器，导致：
- Trust Wallet、Phantom 等不支持的钱包一直弹出
- 用户体验混乱
- 无法控制显示哪些钱包选项

## 解决方案

创建了一个自定义的钱包选择器 UI，只显示我们支持的钱包：
1. **MetaMask** - 浏览器扩展钱包
2. **WalletConnect** - 移动端钱包连接（待完整实现）

## 实现细节

### 1. 新增文件

#### `src/utils/walletConnection.ts`
钱包连接工具模块，包含：

```typescript
// 检查 MetaMask 是否安装
isMetaMaskInstalled(): boolean

// 获取 MetaMask Provider
getMetaMaskProvider()

// 连接 MetaMask
connectMetaMask(): Promise<WalletConnectionResult>

// 连接 WalletConnect (占位符)
connectWalletConnect(): Promise<WalletConnectionResult>

// 获取当前 Provider (用于读取操作)
getCurrentProvider()

// 切换网络
switchToNetwork(chainId, chainIdHex, networkConfig): Promise<boolean>
```

**核心逻辑 - 智能 MetaMask 检测：**
```typescript
export function getMetaMaskProvider() {
  if (!window.ethereum) return null;

  // 如果有多个钱包，找到 MetaMask
  if (window.ethereum.providers?.length) {
    return window.ethereum.providers.find((p: any) => p.isMetaMask) || null;
  }

  // 如果是 MetaMask，直接返回
  if (window.ethereum.isMetaMask) {
    return window.ethereum;
  }

  return null;
}
```

### 2. 更新的文件

#### `src/App.tsx`

**新增状态：**
```typescript
const [showWalletModal, setShowWalletModal] = useState(false);
```

**新增函数：**

1. **显示钱包选择器**
```typescript
const handleConnectWallet = () => {
  setShowWalletModal(true);
};
```

2. **处理钱包选择**
```typescript
const handleWalletSelect = async (walletType: WalletType) => {
  setShowWalletModal(false);

  if (walletType === 'metamask') {
    result = await connectMetaMask();
  } else if (walletType === 'walletconnect') {
    result = await connectWalletConnect();
  }

  // 检查并切换网络
  if (result.chainId !== NETWORK_CONFIG.chainId) {
    await switchToNetwork(...);
  }

  // 更新状态
  setWalletState({ connected: true, address: result.address, ... });
};
```

**新增 UI 组件：**
```tsx
{showWalletModal && (
  <div className="wallet-modal-overlay">
    <div className="wallet-modal">
      <h2>Connect Wallet</h2>

      {/* MetaMask 选项 */}
      <div className="wallet-option" onClick={() => handleWalletSelect('metamask')}>
        <div className="wallet-option-icon">🦊</div>
        <div className="wallet-option-info">
          <h3>MetaMask</h3>
          <p>Connect with MetaMask extension</p>
        </div>
      </div>

      {/* WalletConnect 选项 */}
      <div className="wallet-option" onClick={() => handleWalletSelect('walletconnect')}>
        <div className="wallet-option-icon">🔗</div>
        <div className="wallet-option-info">
          <h3>WalletConnect</h3>
          <p>Scan with mobile wallet</p>
        </div>
      </div>
    </div>
  </div>
)}
```

#### `src/App.css`

新增样式：
- `.wallet-modal-overlay` - 模态框遮罩层
- `.wallet-modal` - 模态框容器
- `.wallet-modal-header` - 模态框头部
- `.wallet-option` - 钱包选项卡片
- `.wallet-option-icon` - 钱包图标
- `.wallet-option-info` - 钱包信息
- 动画效果：`fadeIn`, `slideUp`

#### `src/sdk/explorerContract.ts`

更新所有合约交互函数：
```typescript
// 之前
const provider = getEthereumProvider();

// 现在
import { getCurrentProvider } from '../utils/walletConnection';
const provider = getCurrentProvider();
```

## 工作流程

### 用户连接钱包

1. **点击 "Connect Wallet" 按钮**
   - 触发 `handleConnectWallet()`
   - 设置 `showWalletModal = true`

2. **显示自定义钱包选择器**
   - 模态框弹出
   - 显示 MetaMask 和 WalletConnect 选项
   - **只显示这两个选项，不会触发其他钱包**

3. **用户选择 MetaMask**
   - 点击 MetaMask 选项
   - 调用 `handleWalletSelect('metamask')`
   - 关闭模态框

4. **连接 MetaMask**
   - 调用 `connectMetaMask()`
   - 获取 MetaMask 的 Provider
   - 只向 MetaMask 发送 `eth_requestAccounts` 请求
   - **不会触发 Trust Wallet 或其他钱包**

5. **检查网络**
   - 如果不是 OP Sepolia，提示切换
   - 自动调用 `switchToNetwork()`

6. **连接成功**
   - 更新 `walletState`
   - 显示钱包地址
   - 加载余额和白名单状态

### 刷新页面后

1. **自动检查连接状态**
   ```typescript
   useEffect(() => {
     const provider = getCurrentProvider();
     const accounts = await provider.request({ method: 'eth_accounts' });
     if (accounts.length > 0) {
       // 自动恢复连接
       setWalletState({ connected: true, address: accounts[0] });
     }
   }, []);
   ```

2. **如果未连接**
   - 显示 "Connect Wallet" 按钮
   - 用户点击后显示钱包选择器
   - 重复上述流程

## 关键改进

### ✅ 问题 1: 多钱包冲突
**之前：**
```typescript
// 直接使用 window.ethereum，可能连接到错误的钱包
const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
```

**现在：**
```typescript
// 明确获取 MetaMask Provider
const provider = getMetaMaskProvider();
const accounts = await provider.request({ method: 'eth_requestAccounts' });
```

### ✅ 问题 2: 无法控制显示哪些钱包
**之前：** 浏览器显示所有安装的钱包（Trust Wallet, Phantom, etc.）

**现在：** 自定义 UI，只显示 MetaMask 和 WalletConnect

### ✅ 问题 3: 用户体验混乱
**之前：** 用户不知道该选择哪个钱包

**现在：** 清晰的 UI，明确支持的钱包列表

## UI 设计

### 钱包选择器外观

```
┌─────────────────────────────────────┐
│  Connect Wallet                  ×  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🦊  MetaMask              →  │ │
│  │     Connect with MetaMask     │ │
│  │     extension                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🔗  WalletConnect         →  │ │
│  │     Scan with mobile wallet   │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 样式特点

- **模态框遮罩**: 半透明黑色背景
- **卡片设计**: 白色圆角卡片
- **悬停效果**: 卡片上移，边框高亮
- **动画**: 淡入和滑入动画
- **响应式**: 移动端自适应

## WalletConnect 集成

### 当前状态

WalletConnect 目前是占位符实现：
```typescript
export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  return {
    success: false,
    error: 'WalletConnect support coming soon',
  };
}
```

### 完整实现需要

1. **安装依赖**
```bash
npm install @walletconnect/web3-provider
```

2. **实现连接逻辑**
```typescript
import WalletConnectProvider from "@walletconnect/web3-provider";

export async function connectWalletConnect(): Promise<WalletConnectionResult> {
  const provider = new WalletConnectProvider({
    rpc: {
      11155420: "https://api.zan.top/opt-sepolia",
    },
  });

  await provider.enable();

  const accounts = await provider.request({ method: "eth_accounts" });
  const chainId = await provider.request({ method: "eth_chainId" });

  return {
    success: true,
    address: accounts[0],
    chainId: parseInt(chainId, 16),
  };
}
```

3. **存储 Provider**
需要在应用状态中存储 WalletConnect provider，以便后续交互使用。

## 测试场景

### 场景 1: 只安装 MetaMask
1. 点击 "Connect Wallet"
2. 看到钱包选择器
3. 选择 MetaMask
4. MetaMask 弹出连接请求
5. 确认连接
6. **预期**: 成功连接，不弹出其他钱包

### 场景 2: 安装多个钱包（MetaMask + Trust Wallet + Phantom）
1. 点击 "Connect Wallet"
2. 看到钱包选择器（只显示 MetaMask 和 WalletConnect）
3. 选择 MetaMask
4. **只有 MetaMask 弹出连接请求**
5. 确认连接
6. **预期**: 成功连接 MetaMask，Trust Wallet 和 Phantom 不会弹出

### 场景 3: 刷新页面
1. 已连接 MetaMask
2. 刷新页面
3. **预期**: 自动恢复连接状态，显示钱包地址

### 场景 4: 未安装 MetaMask
1. 点击 "Connect Wallet"
2. 选择 MetaMask
3. **预期**: 显示错误 "MetaMask not installed. Please install MetaMask extension."

### 场景 5: 选择 WalletConnect
1. 点击 "Connect Wallet"
2. 选择 WalletConnect
3. **预期**: 当前显示 "WalletConnect support coming soon"
4. **未来**: 显示二维码，用户扫描连接

## 优势

1. **完全控制**: 我们决定显示哪些钱包
2. **用户体验**: 清晰、简洁的选择界面
3. **避免冲突**: 不会意外触发其他钱包
4. **易于扩展**: 未来可以轻松添加更多钱包选项
5. **品牌一致**: 符合应用的整体设计风格

## 部署说明

### 构建成功
```bash
npm run build
# ✓ built in 5.12s
```

### 部署到 develop
```bash
git add .
git commit -m "feat: implement custom wallet selector

- Create custom wallet selector modal UI
- Add MetaMask specific provider detection
- Prevent Trust Wallet/Phantom from interfering
- Add WalletConnect placeholder
- Improve user experience with clear wallet options
- Only show supported wallets (MetaMask + WalletConnect)"

git push origin develop
```

## 下一步

1. **测试自定义钱包选择器**
   - 验证只弹出 MetaMask
   - 确认不会触发 Trust Wallet

2. **完整实现 WalletConnect**
   - 安装 @walletconnect/web3-provider
   - 实现二维码连接
   - 测试移动端钱包

3. **优化 UI**
   - 添加钱包图标（使用 SVG）
   - 改进动画效果
   - 添加加载状态

4. **错误处理**
   - 更详细的错误提示
   - 提供安装指南链接
   - 网络错误重试机制

## 相关文件

- `src/utils/walletConnection.ts` - 钱包连接工具
- `src/App.tsx` - 主应用组件（包含钱包选择器 UI）
- `src/App.css` - 样式文件（包含模态框样式）
- `src/sdk/explorerContract.ts` - 合约交互（使用新的 provider）
