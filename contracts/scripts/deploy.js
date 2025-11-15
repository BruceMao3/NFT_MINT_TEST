const hre = require("hardhat");

async function main() {
  console.log("Deploying SimpleNFT contract to Sepolia...");

  const SimpleNFT = await hre.ethers.getContractFactory("SimpleNFT");

  const baseURI = "https://your-backend-api.com/api/nft/metadata/";
  const nft = await SimpleNFT.deploy("Test NFT Collection", "TNFT", baseURI);

  await nft.waitForDeployment();

  const contractAddress = await nft.getAddress();
  console.log("SimpleNFT deployed to:", contractAddress);

  // Display contract info
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", contractAddress);
  console.log("Max Supply:", await nft.MAX_SUPPLY());
  console.log("Mint Price:", hre.ethers.formatEther(await nft.MINT_PRICE()), "ETH");
  console.log("Total Minted:", await nft.totalMinted());
  console.log("Remaining Supply:", await nft.remainingSupply());

  console.log("\n=== Deployment Complete ===");
  console.log("Save this contract address to your .env file:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await nft.deploymentTransaction().wait(5);
  console.log("Confirmed!");

  // Verify contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("\nVerifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: ["Test NFT Collection", "TNFT", baseURI],
      });
      console.log("Contract verified on Etherscan!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
