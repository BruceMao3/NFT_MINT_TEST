```markdown
### 3. 获取链概览信息

```bash
GET /api/dashboard/overview?chainId={链ID}

> 示例使用 chainId=11155111 (Ethereum Sepolia)
```

**请求头：**
- `X-API-Key`: demo-key-change-me

**查询参数：**
- `chainId` - 链 ID（必需）

**cURL 示例：**

```bash
curl --location 'https://explorer-service.vercel.app/api/dashboard/overview?chainId=11155111' \
--header 'X-API-Key: demo-key-change-me'
```

**响应示例：**

```json
{
  "chainId": "11155111",
  "chainName": "Sepolia",
  "blockNumber": 12345678,
  "blockTimestamp": 1700000000,
  "token": {
    "address": "0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50",
    "paused": false,
    "minterHasRole": true,
    "supply": [
      {
        "id": "1",
        "totalSupply": "1000",
        "maxSupply": "10000",
        "walletCap": "100",
        "vestingTime": "1700000000",
        "isVested": false,
        "uri": "ipfs://..."
      }
    ]
  },
  "minter": {
    "address": "0x80846155490a28521f43CfD53FbDaC9EdCE2cAb9",
    "paused": false,
    "saleActive": true,
    "tokenAddress": "0x597eb74Ee69DB38C8F5567f0E021F38d29Ed7D50",
    "treasuryAddress": "0xdfE0D74197336f824dE4fca2aff2837588E08A99",
    "usdt": "0x...",
    "usdc": "0x...",
    "profitSharingContract": "0x...",
    "uniqueBuyerCount": "42",
    "prices": [
      {
        "id": 1,
        "priceWei": "1000000000000000000",
        "priceUsd": "5000000"
      }
    ],
    "dependencies": [
      {
        "id": 1,
        "prereqId": "0",
        "minBalance": "0"
      }
    ]
  },
  "treasury": {
    "address": "0xdfE0D74197336f824dE4fca2aff2837588E08A99",
    "paused": false,
    "balanceETH": "1000000000000000000",
    "balanceUSDT": "5000000000",
    "balanceUSDC": "3000000000",
    "usdt": "0x...",
    "usdc": "0x..."
  },
  "connections": {
    "minterHasRole": true,
    "tokenMatch": true,
    "treasuryMatch": true
  }
}
```

#### 响应字段说明

**顶层字段：**
- `chainId` (string) - 区块链网络 ID
- `chainName` (string) - 区块链网络名称
- `blockNumber` (number) - 当前区块高度，用于显示数据的时效性
- `blockTimestamp` (number) - 当前区块时间戳（Unix 时间戳），用于计算数据刷新时间

**token 对象** - Explorer Token 合约信息：
- `address` (string) - Token 合约地址
- `paused` (boolean) - 合约是否暂停，`true` 表示所有 token 操作被暂停
- `minterHasRole` (boolean) - Minter 合约是否拥有铸币权限，用于验证系统集成是否正常
- `supply` (array) - 各类型 token 的供应信息数组（通常包含 Power、Oil、Explorer 三种）
  - `id` (string) - Token ID（1=Power, 2=Oil, 3=Explorer）
  - `totalSupply` (string) - 当前已铸造的 token 总量(minted 数量)
  - `maxSupply` (string) - 最大可铸造数量(total supply数量)
  - `walletCap` (string) - 单个钱包最大持有量限制
  - `vestingTime` (string) - 锁仓解锁时间戳，0 表示无锁仓
  - `isVested` (boolean) - 是否已解锁
  - `uri` (string) - Token 元数据 URI（通常为 IPFS 链接）

**minter 对象** - Minter 销售合约信息：
- `address` (string) - Minter 合约地址
- `paused` (boolean) - 合约是否暂停
- `saleActive` (boolean) - 销售是否激活，`false` 时无法购买
- `tokenAddress` (string) - 关联的 Token 合约地址
- `treasuryAddress` (string) - 收款的 Treasury 合约地址
- `usdt` (string) - USDT 代币合约地址，用于 USD 支付
- `usdc` (string) - USDC 代币合约地址，用于 USD 支付
- `profitSharingContract` (string) - 利润分享合约地址
- `uniqueBuyerCount` (string) - 参与买卖的钱包地址数
- `prices` (array) - 各类型 token 的价格信息
  - `id` (number) - Token ID
  - `priceWei` (string) - ETH 价格（以 wei 为单位）
  - `priceUsd` (string) - USD 价格（以最小单位表示，如 6 位小数）
- `dependencies` (array) - Token 购买依赖关系（例如：购买 Oil 需要先持有 Power）
  - `id` (number) - Token ID
  - `prereqId` (string) - 前置依赖的 Token ID，0 表示无依赖
  - `minBalance` (string) - 需要持有的前置 Token 最小数量

**treasury 对象** - Treasury 资金库合约信息：

- `address` (string) - Treasury 合约地址
- `paused` (boolean) - 合约是否暂停
- `balanceETH` (string) - ETH 余额【gathered Token 数量】（以 wei 为单位，1 ETH = 10^18 wei），显示合约持有的 ETH 总量
- `balanceUSDT` (string) - USDT 余额【gathered Token 数量】（以最小单位表示，1 USDT = 10^6 最小单位），显示合约持有的 USDT 总量
- `balanceUSDC` (string) - USDC 余额【gathered Token 数量】（以最小单位表示，1 USDC = 10^6 最小单位），显示合约持有的 USDC 总量
- `usdt` (string) - USDT 代币合约地址
- `usdc` (string) - USDC 代币合约地址

**connections 对象** - 系统集成验证：

- `minterHasRole` (boolean) - Minter 是否有 Token 合约的铸币权限
- `tokenMatch` (boolean) - Minter 中配置的 Token 地址是否与实际 Token 合约匹配
- `treasuryMatch` (boolean) - Minter 中配置的 Treasury 地址是否与实际 Treasury 合约匹配

> 💡 **注意**：所有大数值（如 supply、price、balance）均以字符串形式返回，以避免 JavaScript 数值精度问题。前端需要使用 BigInt 或相关库处理这些值。
```