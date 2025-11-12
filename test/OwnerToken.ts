import { expect } from "chai";
import { ethers } from "hardhat";

describe("MyToken", function () {
  async function deployMyTokenFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    const token = await MyToken.deploy();
    return { token, owner, alice, bob };
  }

  it("should set the right owner", async function () {
    const { token, owner } = await deployMyTokenFixture();
    expect(await token.owner()).to.equal(owner.address);
  });

  it("should mint initial supply to the owner", async function () {
    const { token, owner } = await deployMyTokenFixture();
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(ethers.parseEther("1000"));
  });

  it("only owner can mint tokens", async function () {
    const { token, owner, alice } = await deployMyTokenFixture();

    // ✅ owner can mint
    await token.connect(owner).mint(alice.address, ethers.parseEther("100"));
    const aliceBalance = await token.balanceOf(alice.address);
    expect(aliceBalance).to.equal(ethers.parseEther("100"));

    // 🚫 non-owner cannot mint
    await expect(
      token.connect(alice).mint(alice.address, ethers.parseEther("10"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("only owner can burn tokens", async function () {
    const { token, owner, alice } = await deployMyTokenFixture();

    // mint some first
    await token.connect(owner).mint(alice.address, ethers.parseEther("50"));
    const before = await token.balanceOf(alice.address);

    // burn
    await token.connect(owner).burn(alice.address, ethers.parseEther("20"));
    const after = await token.balanceOf(alice.address);
    expect(after).to.equal(before - ethers.parseEther("20"));

    // non-owner attempt
    await expect(
      token.connect(alice).burn(alice.address, ethers.parseEther("10"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("totalSupply updates correctly after mint and burn", async function () {
    const { token, owner, alice } = await deployMyTokenFixture();

    const initialSupply = await token.totalSupply();
    await token.connect(owner).mint(alice.address, ethers.parseEther("100"));
    const afterMint = await token.totalSupply();
    expect(afterMint).to.equal(initialSupply + ethers.parseEther("100"));

    await token.connect(owner).burn(alice.address, ethers.parseEther("50"));
    const afterBurn = await token.totalSupply();
    expect(afterBurn).to.equal(afterMint - ethers.parseEther("50"));
  });
});
