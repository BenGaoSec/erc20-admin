/**
 * @file interact.ts
 * @description
 * Sanity check script for interacting with a deployed ERC20 contract.
 * 
 * ✅ Validates:
 *  - .env configuration (TOKEN_ADDRESS)
 *  - ABI binding via Hardhat’s ContractFactory
 *  - Account signer permissions
 *  - ERC20 read operations (name/symbol/decimals/balanceOf)
 *  - ERC20 write operation (transfer)
 *
 * Run: npx hardhat run scripts/interact.ts --network localhost
 */

import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file into process.env

async function main() {
  // --- 1️⃣ Read token address from environment ---
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) throw new Error("❌ Please set TOKEN_ADDRESS in .env");

  // --- 2️⃣ Load available accounts (signers) from Hardhat local node ---
  // ethers.getSigners() returns Signer objects with private keys.
  // Here we use:
  //   - deployer: contract owner (msg.sender in constructor)
  //   - alice: a secondary test account for token transfer
  const [deployer, alice] = await ethers.getSigners();

  // --- 3️⃣ Bind the compiled ABI to the deployed contract address ---
  // getContractFactory loads ABI + bytecode from artifacts.
  // attach(address) connects the factory to an existing on-chain instance.
  const MyToken = await ethers.getContractFactory("MyToken");
  const token = MyToken.attach(tokenAddress);

  // --- 4️⃣ Read token metadata from the contract (read-only calls, no gas cost) ---
  console.log("Token name:", await token.name());
  console.log("Token symbol:", await token.symbol());
  console.log("Token decimals:", await token.decimals());

  // --- 5️⃣ Query deployer’s token balance ---
  // Returns BigInt (wei-style smallest unit)
  const balDeployer = await token.balanceOf(deployer.address);
  console.log("Deployer balance:", balDeployer.toString());

  // --- 6️⃣ Prepare transfer amount (10 tokens) ---
  // Convert human-readable 10 → smallest units (10 * 10^decimals)
  const amount = ethers.parseUnits("10", await token.decimals());

  // --- 7️⃣ Execute ERC20 transfer from deployer → alice ---
  // Since transfer modifies state, it’s a signed transaction (consumes gas)
  const tx = await token.transfer(alice.address, amount);
  await tx.wait(); // Wait until the transaction is mined
  console.log(`✅ Transferred 10 tokens to ${alice.address}`);

  // --- 8️⃣ Confirm alice’s new balance ---
  const balAlice = await token.balanceOf(alice.address);
  const humanReadable = ethers.formatUnits(balAlice, 18);
  console.log("Alice balance:", humanReadable);
}

// --- 9️⃣ Entrypoint + global error handler ---
main().catch((e) => {
  console.error("❌ Script failed:", e);
  process.exit(1);
});
