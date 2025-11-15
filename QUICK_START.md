# NFT Mint 项目快速启动指南

## 项目概述

本项目是一个完整的 NFT Mint 应用,包含:
- ✅ React 前端 (带用户 NFT 展示)
- ✅ 智能合约 (SimpleNFT ERC721)
- ✅ Express 后端 API
- ✅ 完整的 E2E 测试
- ✅ 部署文档

## 快速测试 (本地环境)

### 1. 测试后端 API

后端已经在运行了!测试一下:

```bash
# 健康检查
curl http://localhost:3000/health

# 获取 NFT 信息
curl http://localhost:3000/api/nft/info

# 获取统计数据
curl http://localhost:3000/api/nft/stats

# 获取用户 NFT (示例地址)
curl http://localhost:3000/api/nft/user/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
```

### 2. 启动前端 (开发模式)

在项目根目录:

```bash
# 确保在 test mode
echo "VITE_TEST_MODE=true" > .env
echo "VITE_API_BASE_URL=http://localhost:3000" >> .env

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

### 3. 运行测试

```bash
npm test
```

应该看到所有 15 个测试通过! ✅

## 部署到生产环境

### 准备工作

你需要:
1. **Sepolia 测试 ETH** - 从 [Sepolia Faucet](https://sepoliafaucet.com/) 获取
2. **Alchemy API Key** - 从 [Alchemy](https://www.alchemy.com/) 注册获取
3. **钱包私钥** - 从 MetaMask 导出 (测试钱包!)
4. **Etherscan API Key** (可选) - 用于验证合约

### 步骤 1: 部署智能合约

```bash
cd contracts

# 配置环境变量
cp .env.example .env
nano .env  # 填入你的配置

# 部署到 Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**保存合约地址!** 你会看到类似:
```
SimpleNFT deployed to: 0x1234567890...
```

### 步骤 2: 配置后端

```bash
cd ../backend

# 编辑 .env
nano .env
```

填入:
```env
PORT=3000
CONTRACT_ADDRESS=你的合约地址
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

### 步骤 3: 部署后端到腾讯云

#### 方式 1: 使用 SSH 直接部署

```bash
# 1. 连接到服务器
ssh user@your-server-ip

# 2. 克隆代码
git clone https://github.com/yourusername/NFT_MINT_TEST.git
cd NFT_MINT_TEST/backend

# 3. 安装依赖
npm install

# 4. 配置环境变量
nano .env  # 填入配置

# 5. 使用 PM2 启动
npm install -g pm2
pm2 start index.js --name nft-backend
pm2 save
pm2 startup

# 6. 查看日志
pm2 logs nft-backend
```

#### 方式 2: 使用 Nginx 反向代理

```bash
# 安装 Nginx
sudo apt-get install nginx

# 创建配置
sudo nano /etc/nginx/sites-available/nft-backend
```

配置内容:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用:
```bash
sudo ln -s /etc/nginx/sites-available/nft-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 步骤 4: 配置前端

在项目根目录编辑 `.env`:

```env
VITE_TEST_MODE=false
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_CONTRACT_ADDRESS=你的合约地址
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

构建:
```bash
npm run build
```

### 步骤 5: 部署前端

#### 选项 A: Vercel (推荐,最简单)

```bash
npm install -g vercel
vercel
```

按提示操作,在 dashboard 配置环境变量。

#### 选项 B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### 选项 C: 腾讯云 (静态文件)

```bash
# 上传 dist/ 文件夹到服务器
scp -r dist/ user@your-server:/var/www/html/nft-mint/
```

Nginx 配置:
```nginx
server {
    listen 80;
    server_name your-frontend-domain.com;
    root /var/www/html/nft-mint;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 测试完整流程

### 1. 测试合约

```bash
cd contracts
npx hardhat console --network sepolia
```

```javascript
const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
const nft = await SimpleNFT.attach("你的合约地址");

// 查看状态
await nft.MAX_SUPPLY();
await nft.totalMinted();
await nft.MINT_PRICE();
```

### 2. 测试后端

```bash
curl https://your-backend-domain.com/health
curl https://your-backend-domain.com/api/nft/info
curl https://your-backend-domain.com/api/nft/stats
```

### 3. 测试前端

1. 访问你的前端 URL
2. 连接 MetaMask (确保在 Sepolia 网络)
3. 点击 "Mint NFT"
4. 确认交易
5. 等待交易完成
6. 查看 "My NFTs" 部分

## 常见问题

### Q: 部署合约失败 - Insufficient funds
**A:** 确保钱包有足够的 Sepolia ETH,从 faucet 获取更多

### Q: 前端无法连接钱包
**A:** 确保 MetaMask 已安装并切换到 Sepolia 网络

### Q: 后端 CORS 错误
**A:** 后端已配置 CORS,检查前端的 API_BASE_URL 是否正确

### Q: 交易失败
**A:** 检查:
- 钱包是否有足够的 Sepolia ETH
- 合约地址是否正确
- RPC URL 是否可用

### Q: NFT 不显示
**A:** 检查:
- 后端 /api/nft/user/:address 接口是否正常
- 浏览器控制台是否有错误
- 合约是否正确记录了 NFT

## 项目文件说明

```
NFT_MINT_TEST/
├── src/                        # 前端源代码
│   ├── sdk/                    # Framework-agnostic SDK
│   ├── App.tsx                 # 主应用组件 (含 NFT 展示)
│   └── App.css                 # 样式 (含 NFT 卡片样式)
├── tests/                      # Playwright 测试
│   └── nft-mint.spec.ts        # E2E 测试
├── contracts/                  # 智能合约
│   ├── contracts/
│   │   └── SimpleNFT.sol       # ERC721 NFT 合约
│   ├── scripts/
│   │   └── deploy.js           # 部署脚本
│   └── hardhat.config.js       # Hardhat 配置
├── backend/                    # 后端服务
│   ├── index.js                # Express API 服务器
│   └── package.json            # 依赖配置
├── DEPLOYMENT_GUIDE.md         # 详细部署指南
├── UPDATES.md                  # 更新日志
└── QUICK_START.md              # 本文件
```

## 下一步

1. **本地测试**:
   ```bash
   npm run dev  # 前端
   npm start    # 后端 (在 backend/ 目录)
   npm test     # 测试
   ```

2. **部署合约**: 参考上面步骤 1

3. **部署后端**: 参考上面步骤 2-3

4. **部署前端**: 参考上面步骤 4-5

5. **完整测试**: 用真实钱包测试 mint 流程

## 获取帮助

- 详细部署指南: 查看 `DEPLOYMENT_GUIDE.md`
- 更新日志: 查看 `UPDATES.md`
- GitHub Issues: 提交问题到仓库

祝你部署顺利! 🚀
