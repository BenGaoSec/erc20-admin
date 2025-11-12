import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const NAME = process.env.TOKEN_NAME || "MyToken";
  const SYMBOL = process.env.TOKEN_SYMBOL || "MYT";
  const DECIMALS = Number(process.env.TOKEN_DECIMALS || 18);
  const INITIAL_SUPPLY_TOKENS = process.env.INITIAL_SUPPLY_TOKENS || "1000000";

  const initialSupply = ethers.parseUnits(INITIAL_SUPPLY_TOKENS, DECIMALS);

  // 注意：两个文件里 contract 名相同，所以要写全路径
  const MyTokenV1 = await ethers.getContractFactory("contracts/MyToken.sol:MyToken");
  const MyTokenV2 = await ethers.getContractFactory("contracts/OwnerToken.sol:MyToken");

  const tokenV1 = await MyTokenV1.deploy(NAME, SYMBOL, initialSupply);
  const tokenV2 = await MyTokenV2.deploy(NAME, SYMBOL, initialSupply);

  await tokenV1.waitForDeployment();
  await tokenV2.waitForDeployment();

  const addressV1 = await tokenV1.getAddress();
  const addressV2 = await tokenV2.getAddress();

  console.log(`✅ Deployed MyTokenV1 at: ${addressV1}`);
  console.log(`✅ Deployed MyTokenV2 at: ${addressV2}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
