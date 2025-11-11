/**
 * Deploy MyToken with human-friendly params from .env (fallback to defaults)
 */
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const NAME = process.env.TOKEN_NAME || "MyToken";
  const SYMBOL = process.env.TOKEN_SYMBOL || "MYT";
  const DECIMALS = Number(process.env.TOKEN_DECIMALS || 18);
  const INITIAL_SUPPLY_TOKENS = process.env.INITIAL_SUPPLY_TOKENS || "1000000";

  // Convert human amount to smallest units to avoid 10^n mistakes
  const initialSupply = ethers.parseUnits(INITIAL_SUPPLY_TOKENS, DECIMALS);

  const MyToken = await ethers.getContractFactory("MyToken");
  const token = await MyToken.deploy(NAME, SYMBOL, initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log(`✅ Deployed MyToken at: ${address}`);
  console.log({ NAME, SYMBOL, DECIMALS, INITIAL_SUPPLY_TOKENS });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
