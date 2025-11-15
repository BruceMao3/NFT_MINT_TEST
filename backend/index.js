const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo (replace with database in production)
const mintRecords = [];
const userNFTs = {}; // walletAddress => NFT[]

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';

// Initialize provider and contract (optional, for reading from chain)
let provider, contract;
if (process.env.CONTRACT_ADDRESS) {
  try {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

    // Simple ABI for reading contract data
    const contractABI = [
      "function MAX_SUPPLY() view returns (uint256)",
      "function MINT_PRICE() view returns (uint256)",
      "function totalMinted() view returns (uint256)",
      "function remainingSupply() view returns (uint256)",
      "function totalFundsRaised() view returns (uint256)",
      "function tokensOfOwner(address) view returns (uint256[])"
    ];

    contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
  } catch (error) {
    console.warn('Could not initialize contract connection:', error.message);
  }
}

// API Routes

/**
 * GET /api/nft/info
 * Returns NFT contract information
 */
app.get('/api/nft/info', async (req, res) => {
  try {
    let contractInfo;

    if (contract) {
      // Read from actual contract
      const [maxSupply, mintPrice] = await Promise.all([
        contract.MAX_SUPPLY(),
        contract.MINT_PRICE()
      ]);

      contractInfo = {
        contractAddress: CONTRACT_ADDRESS,
        totalSupply: Number(maxSupply),
        mintPrice: ethers.formatEther(mintPrice),
        maxSupply: Number(maxSupply),
        name: 'Test NFT Collection',
        symbol: 'TNFT',
      };
    } else {
      // Return mock data
      contractInfo = {
        contractAddress: CONTRACT_ADDRESS,
        totalSupply: 10000,
        mintPrice: '0.0001',
        maxSupply: 10000,
        name: 'Test NFT Collection',
        symbol: 'TNFT',
      };
    }

    res.json({
      code: 200,
      message: 'success',
      data: contractInfo,
    });
  } catch (error) {
    console.error('Error fetching NFT info:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/stats
 * Returns real-time minting statistics
 */
app.get('/api/nft/stats', async (req, res) => {
  try {
    let stats;

    if (contract) {
      // Read from actual contract
      const [totalMinted, remainingSupply, totalFundsRaised] = await Promise.all([
        contract.totalMinted(),
        contract.remainingSupply(),
        contract.totalFundsRaised()
      ]);

      stats = {
        totalMinted: Number(totalMinted),
        remainingSupply: Number(remainingSupply),
        totalFundsRaised: ethers.formatEther(totalFundsRaised),
        remainingFunds: ethers.formatEther(BigInt(remainingSupply) * await contract.MINT_PRICE()),
        lastMintTime: new Date().toISOString(),
      };
    } else {
      // Return mock data
      const mockTotalMinted = 1766 + mintRecords.length;
      stats = {
        totalMinted: mockTotalMinted,
        remainingSupply: 10000 - mockTotalMinted,
        totalFundsRaised: (mockTotalMinted * 0.0001).toFixed(4),
        remainingFunds: ((10000 - mockTotalMinted) * 0.0001).toFixed(4),
        lastMintTime: new Date().toISOString(),
      };
    }

    res.json({
      code: 200,
      message: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching NFT stats:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

/**
 * POST /api/nft/mint-record
 * Records a completed mint transaction
 */
app.post('/api/nft/mint-record', async (req, res) => {
  try {
    const { walletAddress, txHash, amount, timestamp } = req.body;

    if (!walletAddress || !txHash) {
      return res.status(400).json({
        code: 400,
        message: 'Missing required fields',
      });
    }

    const record = {
      recordId: `rec_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      walletAddress: walletAddress.toLowerCase(),
      txHash,
      amount,
      timestamp: timestamp || new Date().toISOString(),
    };

    mintRecords.push(record);

    // Also add to user's NFT list (in production, would extract tokenId from transaction)
    const normalizedAddress = walletAddress.toLowerCase();
    if (!userNFTs[normalizedAddress]) {
      userNFTs[normalizedAddress] = [];
    }

    const tokenId = (1000 + userNFTs[normalizedAddress].length + 1).toString();
    userNFTs[normalizedAddress].push({
      tokenId,
      name: `Test NFT #${tokenId}`,
      image: `https://via.placeholder.com/250/667eea/ffffff?text=NFT+%23${tokenId}`,
      mintedAt: timestamp || new Date().toISOString(),
      txHash,
    });

    res.json({
      code: 200,
      message: 'Record saved successfully',
      data: {
        recordId: record.recordId,
      },
    });
  } catch (error) {
    console.error('Error recording mint transaction:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/user/:address
 * Returns NFTs owned by a wallet address
 */
app.get('/api/nft/user/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const normalizedAddress = address.toLowerCase();

    let nfts = [];

    if (contract) {
      // Read from actual contract
      try {
        const tokenIds = await contract.tokensOfOwner(address);
        nfts = tokenIds.map((tokenId, index) => ({
          tokenId: tokenId.toString(),
          name: `Test NFT #${tokenId}`,
          image: `https://via.placeholder.com/250/667eea/ffffff?text=NFT+%23${tokenId}`,
          mintedAt: new Date(Date.now() - index * 86400000).toISOString(), // Mock dates
          txHash: `0x${Math.random().toString(16).slice(2).padStart(64, '0')}`, // Mock tx hash
        }));
      } catch (error) {
        console.warn('Error reading from contract, using mock data:', error.message);
      }
    }

    // Fallback to in-memory data if contract read fails or not available
    if (nfts.length === 0 && userNFTs[normalizedAddress]) {
      nfts = userNFTs[normalizedAddress];
    }

    res.json({
      code: 200,
      message: 'success',
      data: nfts,
    });
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
});

/**
 * GET /api/nft/metadata/:tokenId
 * Returns metadata for a specific NFT (ERC721 metadata standard)
 */
app.get('/api/nft/metadata/:tokenId', (req, res) => {
  const { tokenId } = req.params;

  const metadata = {
    name: `Test NFT #${tokenId}`,
    description: 'A test NFT from the NFT Mint Test project',
    image: `https://via.placeholder.com/500/667eea/ffffff?text=NFT+%23${tokenId}`,
    attributes: [
      {
        trait_type: 'Type',
        value: 'Test',
      },
      {
        trait_type: 'Token ID',
        value: tokenId,
      },
      {
        trait_type: 'Generation',
        value: '1',
      },
    ],
  };

  res.json(metadata);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    contract: CONTRACT_ADDRESS,
    connected: !!contract,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n=== NFT Mint Backend Server ===`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Contract address: ${CONTRACT_ADDRESS}`);
  console.log(`Contract connected: ${!!contract}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET  /health`);
  console.log(`  GET  /api/nft/info`);
  console.log(`  GET  /api/nft/stats`);
  console.log(`  GET  /api/nft/user/:address`);
  console.log(`  GET  /api/nft/metadata/:tokenId`);
  console.log(`  POST /api/nft/mint-record`);
  console.log(`\n================================\n`);
});
