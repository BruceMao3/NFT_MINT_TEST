# NFT Mint 项目部署指南

这个指南将帮助你部署完整的 NFT Mint 项目,包括智能合约部署到 Sepolia 测试网和后端服务部署。

## 目录

1. [前置准备](#前置准备)
2. [部署智能合约到 Sepolia](#部署智能合约到-sepolia)
3. [部署后端服务](#部署后端服务)
4. [配置前端](#配置前端)
5. [测试完整流程](#测试完整流程)

## 前置准备

### 1. 获取 Sepolia 测试网 ETH

1. 访问 [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
2. 或 [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
3. 输入你的钱包地址获取测试 ETH

### 2. 获取 API 密钥

**Alchemy (推荐)**
1. 访问 [Alchemy](https://www.alchemy.com/)
2. 创建账号并新建一个 App
3. 选择 Sepolia 测试网
4. 复制 HTTP API URL

**Etherscan (用于合约验证)**
1. 访问 [Etherscan](https://etherscan.io/)
2. 注册账号并获取 API Key

## 部署智能合约到 Sepolia

### 1. 配置环境变量

进入 contracts 目录:
```bash
cd contracts
cp .env.example .env
```

编辑 `.env` 文件:
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-ALCHEMY-API-KEY
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

**重要提示**:
- 不要提交 `.env` 文件到 Git
- 使用测试钱包,不要使用包含真实资产的钱包
- Private Key 从 MetaMask 导出: 账户详情 -> 导出私钥

### 2. 编译合约

```bash
npx hardhat compile
```

### 3. 部署合约

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

部署成功后,你会看到类似输出:
```
SimpleNFT deployed to: 0x1234567890123456789012345678901234567890
Max Supply: 10000
Mint Price: 0.0001 ETH
```

**保存合约地址!** 你需要在后端和前端配置中使用它。

### 4. 验证合约 (可选但推荐)

如果部署脚本自动验证失败,手动验证:
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Test NFT Collection" "TNFT" "https://your-backend-api.com/api/nft/metadata/"
```

## 部署后端服务

### 选项 1: 部署到腾讯云服务器

#### 1. 连接到服务器

```bash
ssh user@your-server-ip
```

#### 2. 安装 Node.js (如果还没有)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 3. 上传后端代码

使用 scp 或 git clone:
```bash
# 方式 1: 使用 scp
scp -r backend/ user@your-server-ip:/path/to/deployment/

# 方式 2: 使用 git (推荐)
git clone https://github.com/yourusername/NFT_MINT_TEST.git
cd NFT_MINT_TEST/backend
```

#### 4. 安装依赖

```bash
cd backend
npm install
```

#### 5. 配置环境变量

```bash
cp .env.example .env
nano .env  # 或使用 vim
```

填入配置:
```env
PORT=3000
CONTRACT_ADDRESS=你部署的合约地址
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

#### 6. 使用 PM2 运行服务 (保持后台运行)

安装 PM2:
```bash
sudo npm install -g pm2
```

启动服务:
```bash
pm2 start index.js --name nft-backend
pm2 save
pm2 startup  # 设置开机自启
```

查看日志:
```bash
pm2 logs nft-backend
```

#### 7. 配置 Nginx 反向代理 (可选)

安装 Nginx:
```bash
sudo apt-get install nginx
```

创建配置文件:
```bash
sudo nano /etc/nginx/sites-available/nft-backend
```

添加配置:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/nft-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. 配置防火墙

```bash
sudo ufw allow 3000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 选项 2: 部署到 Vercel/Railway (免费)

#### 使用 Vercel

1. 安装 Vercel CLI:
```bash
npm install -g vercel
```

2. 在 backend 目录下创建 `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

3. 部署:
```bash
cd backend
vercel
```

4. 在 Vercel dashboard 配置环境变量

#### 使用 Railway

1. 访问 [Railway.app](https://railway.app/)
2. 连接 GitHub 仓库
3. 选择 backend 目录
4. 添加环境变量
5. 部署

## 配置前端

### 1. 更新环境变量

编辑项目根目录的 `.env`:
```env
VITE_TEST_MODE=false
VITE_API_BASE_URL=https://your-backend-url.com
VITE_CONTRACT_ADDRESS=你部署的合约地址
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
```

### 2. 构建前端

```bash
npm run build
```

### 3. 部署前端

**选项 1: Vercel**
```bash
npm install -g vercel
vercel
```

**选项 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**选项 3: GitHub Pages**
```bash
npm run build
# 将 dist/ 目录内容推送到 gh-pages 分支
```

## 测试完整流程

### 1. 测试后端 API

```bash
# 健康检查
curl https://your-backend-url.com/health

# 获取 NFT 信息
curl https://your-backend-url.com/api/nft/info

# 获取统计数据
curl https://your-backend-url.com/api/nft/stats
```

### 2. 测试智能合约

在 Hardhat console 中:
```bash
npx hardhat console --network sepolia
```

```javascript
const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
const nft = await SimpleNFT.attach("你的合约地址");

// 查看信息
await nft.MAX_SUPPLY();
await nft.totalMinted();
await nft.MINT_PRICE();
```

### 3. 测试前端

1. 访问你部署的前端 URL
2. 连接 MetaMask 钱包 (确保在 Sepolia 测试网)
3. 尝试 Mint 一个 NFT
4. 检查交易是否成功
5. 确认 NFT 显示在"My NFTs"部分

## 常见问题

### 合约部署失败

**问题**: Insufficient funds
**解决**: 确保钱包中有足够的 Sepolia ETH

**问题**: Network error
**解决**: 检查 RPC URL 是否正确,Alchemy API Key 是否有效

### 后端连接失败

**问题**: CORS error
**解决**: 确保后端已启用 CORS,检查前端配置的 API URL

**问题**: Contract connection failed
**解决**: 验证合约地址和 RPC URL 配置是否正确

### 前端钱包连接失败

**问题**: Wrong network
**解决**: 在 MetaMask 中切换到 Sepolia 测试网

**问题**: Transaction failed
**解决**: 检查合约是否正确部署,钱包是否有足够的 ETH

## 生产环境注意事项

1. **安全性**
   - 不要在代码中硬编码私钥
   - 使用环境变量管理敏感信息
   - 启用 HTTPS (使用 Let's Encrypt)

2. **数据库**
   - 生产环境应使用真实数据库 (PostgreSQL, MongoDB)
   - 不要依赖内存存储

3. **监控**
   - 设置日志系统
   - 使用 Sentry 等错误追踪服务
   - 配置服务器监控

4. **备份**
   - 定期备份数据库
   - 保存合约源代码和部署信息

## 获取帮助

如遇到问题,请:
1. 查看 GitHub Issues
2. 检查服务器日志
3. 验证所有配置是否正确

祝部署顺利!
