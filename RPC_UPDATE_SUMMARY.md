# RPC URL 更新摘要

## 更新内容

已将所有配置文件中的 RPC URL 从公共 RPC 更新为 ZAN 的私有 RPC。

### 主要 RPC URL
- **新 RPC**: `https://api.zan.top/opt-sepolia`
- **备用 RPC**: `https://sepolia.optimism.io` (公共 RPC，作为 fallback)

## 已更新的文件

### 1. `.env` ✅
```env
VITE_RPC_URL=https://api.zan.top/opt-sepolia
```

### 2. `src/contracts/config.ts` ✅
此文件已经使用正确的 RPC URL（从 frontend-exports 复制时就是正确的）：
```typescript
export const NETWORK_CONFIG = {
  rpcUrl: 'https://api.zan.top/opt-sepolia',
  publicRpcUrl: 'https://sepolia.optimism.io', // fallback
  // ...
}
```

### 3. 文档更新 ✅
- `VERCEL_SETUP.md` - 所有环境变量配置示例
- `QUICK_DEPLOY.md` - 快速部署指南中的配置

## 验证

✅ **构建测试通过**
```bash
npm run build
# ✓ built in 5.01s
```

## Vercel 环境变量配置

在 Vercel 上配置环境变量时，使用以下值：

```
VITE_RPC_URL = https://api.zan.top/opt-sepolia
```

应用于所有环境（Production, Preview, Development）。

## 网络配置说明

### 前端使用的 RPC
前端会优先使用 `config.ts` 中配置的 `rpcUrl`：
```typescript
rpcUrl: 'https://api.zan.top/opt-sepolia'  // 主 RPC
publicRpcUrl: 'https://sepolia.optimism.io' // 备用 RPC
```

### 添加网络到 MetaMask
当用户需要添加 OP Sepolia 网络时，应用会使用以下配置：

```javascript
{
  chainId: '0xaa37dc',
  chainName: 'OP Sepolia',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['https://sepolia.optimism.io'],  // 使用公共 RPC
  blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
}
```

> 💡 **注意**：添加网络到 MetaMask 时使用公共 RPC (`publicRpcUrl`)，因为 ZAN 的 RPC 可能需要认证。应用内部操作会使用主 RPC。

## RPC 性能对比

### ZAN RPC (https://api.zan.top/opt-sepolia)
- ✅ 更快的响应速度
- ✅ 更高的稳定性
- ✅ 更好的请求限制
- ✅ 专业的节点服务

### 公共 RPC (https://sepolia.optimism.io)
- ⚠️ 可能有速率限制
- ⚠️ 高峰期可能较慢
- ✅ 无需认证
- ✅ 适合作为 fallback

## 代码中的 RPC 使用

### 1. 合约读取操作
使用 `config.ts` 中的主 RPC：
```typescript
const result = await window.ethereum.request({
  method: 'eth_call',
  params: [{ to: CONTRACT_ADDRESSES.Minter, data }, 'latest'],
});
```

### 2. 交易发送
通过用户钱包（MetaMask）发送，使用钱包配置的 RPC：
```typescript
const txHash = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [transactionParameters],
});
```

### 3. 网络切换
提示用户切换网络时，添加公共 RPC：
```typescript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: NETWORK_CONFIG.chainIdHex,
    rpcUrls: [NETWORK_CONFIG.publicRpcUrl],  // 使用公共 RPC
  }],
});
```

## 故障排查

### 如果 ZAN RPC 不可用

1. **检查 RPC 状态**
   ```bash
   curl https://api.zan.top/opt-sepolia
   ```

2. **临时切换到公共 RPC**
   在 `.env` 中：
   ```env
   VITE_RPC_URL=https://sepolia.optimism.io
   ```

3. **在 Vercel 更新环境变量**
   ```
   VITE_RPC_URL = https://sepolia.optimism.io
   ```

### 测试 RPC 连接

使用以下命令测试 RPC：
```bash
# 测试 ZAN RPC
curl -X POST https://api.zan.top/opt-sepolia \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# 测试公共 RPC
curl -X POST https://sepolia.optimism.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## 部署建议

1. ✅ 保持 `.env` 中的 `VITE_RPC_URL=https://api.zan.top/opt-sepolia`
2. ✅ 在 Vercel 上设置相同的环境变量
3. ✅ 保留 `config.ts` 中的 `publicRpcUrl` 作为 fallback
4. ✅ 测试网络切换功能，确保能正常添加网络到 MetaMask

## 总结

所有文件已更新完毕，使用 ZAN 的 RPC URL。配置已保留公共 RPC 作为备用，确保服务的可用性和稳定性。

**无需修改代码**，只需要更新配置文件即可。✅
