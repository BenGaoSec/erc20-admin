import { expect } from "chai";
import { ethers } from "hardhat";

// Parse human amount to smallest units (bigint)
function u(amount: number | string, decimals = 18) {
  return ethers.parseUnits(amount.toString(), decimals);
}

describe("MyToken", () => {
  it("metadata and initial supply", async () => {
    const [owner] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy("MyToken", "MYT", u(1_000_000));
    await token.waitForDeployment();

    expect(await token.name()).to.equal("MyToken");
    expect(await token.symbol()).to.equal("MYT");
    expect(await token.decimals()).to.equal(18);

    const total = await token.totalSupply();
    const ownerBal = await token.balanceOf(owner.address);
    expect(ownerBal).to.equal(total);
  });

  it("owner can mint, others cannot; holders can burn", async () => {
    const [owner, alice, bob] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy("MyToken", "MYT", u(1000));
    await token.waitForDeployment();

    // owner mint
    await expect(token.connect(owner).mint(alice.address, u(100))).to.emit(
      token,
      "Transfer"
    );

    // non-owner mint reverts with OZ v5 custom error
    await expect(token.connect(alice).mint(bob.address, u(1)))
      .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount")
      .withArgs(alice.address);

    // burn by holder
    const before = await token.balanceOf(owner.address);
    await token.connect(owner).burn(u(10));
    const after = await token.balanceOf(owner.address);
    expect(after).to.equal(before - u(10));
  });

  it("transfer & allowance flow", async () => {
    const [owner, alice, bob] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy("MyToken", "MYT", u(1000));
    await token.waitForDeployment();

    // owner -> alice
    await token.transfer(alice.address, u(100));
    expect(await token.balanceOf(alice.address)).to.equal(u(100));

    // alice approves bob
    await token.connect(alice).approve(bob.address, u(40));
    expect(await token.allowance(alice.address, bob.address)).to.equal(u(40));

    // bob transfers from alice
    await token.connect(bob).transferFrom(alice.address, bob.address, u(30));
    expect(await token.balanceOf(bob.address)).to.equal(u(30));
    expect(await token.balanceOf(alice.address)).to.equal(u(70));
  });
});
