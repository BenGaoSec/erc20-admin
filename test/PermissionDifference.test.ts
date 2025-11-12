import { ethers } from "hardhat";
import { expect } from "chai";

describe("Permission Difference Visualized", function () {
  const NAME = "MyToken";
  const SYMBOL = "MYT";
  const SUPPLY = ethers.parseUnits("1000", 18);

  async function deploy(contractName: string) {
    const Factory = await ethers.getContractFactory(contractName);
    const token = await Factory.deploy(NAME, SYMBOL, SUPPLY);
    await token.waitForDeployment();
    const [owner, user] = await ethers.getSigners();
    console.log(`\n🧩 Deployed ${contractName} at: ${await token.getAddress()}`);
    console.log(`   Owner: ${owner.address}`);
    console.log(`   User:  ${user.address}`);
    return { token, owner, user };
  }

  async function showBalances(token: any, owner: any, user: any, label: string) {
    const o = await token.balanceOf(owner.address);
    const u = await token.balanceOf(user.address);
    console.log(`   💰 [${label}] Owner=${ethers.formatUnits(o, 18)} | User=${ethers.formatUnits(u, 18)}`);
  }

  it("MyToken (开放版): anyone can mint & burn", async function () {
    const { token, owner, user } = await deploy("MyToken");

    console.log("\n🚀 Scenario: user mints freely");
    await token.connect(user).mint(user.address, 100);
    await showBalances(token, owner, user, "after user mint");

    console.log("\n🔥 Scenario: user burns freely");
    await token.connect(user).burn(user.address, 50);
    await showBalances(token, owner, user, "after user burn");

    const total = await token.totalSupply();
    console.log(`\n📊 Total supply after actions: ${ethers.formatUnits(total, 18)}\n`);
  });

  it("MyOwenToken (受控版): only owner can mint/burn", async function () {
    const { token, owner, user } = await deploy("MyOwenToken");

    console.log("\n🚀 Owner mints for user");
    await token.connect(owner).mint(user.address, 100);
    await showBalances(token, owner, user, "after owner mint");

    console.log("\n⚠️ User tries to mint (should fail)");
    try {
      await token.connect(user).mint(user.address, 100);
    } catch (err: any) {
      console.log("   ❌ Reverted:", err.shortMessage || err.message);
    }

    console.log("\n🔥 Owner burns user's tokens");
    await token.connect(owner).burn(user.address, 50);
    await showBalances(token, owner, user, "after owner burn");

    console.log("\n⚠️ User tries to burn (should fail)");
    try {
      await token.connect(user).burn(user.address, 10);
    } catch (err: any) {
      console.log("   ❌ Reverted:", err.shortMessage || err.message);
    }

    const total = await token.totalSupply();
    console.log(`\n📊 Total supply after actions: ${ethers.formatUnits(total, 18)}\n`);
  });
});
