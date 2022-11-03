const { expect } = require("chai");
const { ethers } = require("hardhat");
require("solidity-coverage");

describe("MyNFT contract", function () {
  beforeEach(async () => {
    zero_address = "0x0000000000000000000000000000000000000000";
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    NFT = await ethers.getContractFactory("MyNFT");
    RECEIVER = await ethers.getContractFactory("Receiver")
    ReceiverInstance = await RECEIVER.deploy();
    MyNFTInstance = await NFT.deploy();
  });

  describe("Deployment", () => {
    it("Creates a token with a name", async function () {
      expect(await MyNFTInstance.name()).to.exist;
    });

    it("Creates a token with a symbol", async function () {
      expect(await MyNFTInstance.symbol()).to.exist;
    });
  });

  describe("Mint", () => {
    it("Should Mint With Zero Address", async function () {
      await expect(MyNFTInstance.mint(zero_address, 1)).to.be.revertedWith(
        "mint to zero address"
      );
    });

    it("Should Mint Same Token Multiple Time On Same Address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(MyNFTInstance.mint(addr1.address, 1)).to.be.revertedWith(
        "already minted"
      );
    });

    it("Should Mint Same Token With Different Accounts", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(MyNFTInstance.mint(addr2.address, 1)).to.be.revertedWith(
        "already minted"
      );
    });

    it("Should Increase Balance Of Address After Mint", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      expect(await MyNFTInstance.balanceOf(addr1.address)).to.equal(1);
    });

    it("Should Mint On Right Address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      expect(await MyNFTInstance.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should Emits an Transfer event with the right arguments", async function () {
      await expect(MyNFTInstance.mint(addr1.address, 1))
        .to.emit(MyNFTInstance, "Transfer")
        .withArgs(zero_address, addr1.address, 1);
    });
  });

  describe("Burn", () => {
    it("Should Burn Through Different Address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(MyNFTInstance.connect(addr2).burn(1)).to.be.revertedWith(
        "not owner"
      );
    });

    it("Owner is not equal to zero Address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      expect(await MyNFTInstance.ownerOf(1)).to.be.not.equal(zero_address);
    });

    it("Should Burn Minted Token and deduct form account balance", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await MyNFTInstance.connect(addr1).burn(1);
      expect(await MyNFTInstance.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should Emits an Transfer event with the right arguments", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(MyNFTInstance.connect(addr1).burn(1))
        .to.emit(MyNFTInstance, "Transfer")
        .withArgs(addr1.address, zero_address, 1);
    });
  });

  describe("Approve", () => {
    it("Should Approve", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await MyNFTInstance.connect(addr1).approve(addr2.address, 1);
      expect(await MyNFTInstance.getApproved(1)).to.equal(addr2.address);
    });

    it("Should Approve Through Un authorized Account", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(
        MyNFTInstance.connect(addr2).approve(addr2.address, 1)
      ).to.be.revertedWith("not authorized");
    });

    it("Should Emits an Approval event with the right arguments", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(MyNFTInstance.connect(addr1).approve(addr2.address, 1))
        .to.emit(MyNFTInstance, "Approval")
        .withArgs(addr1.address, addr2.address, 1);
    });
  });
  describe("Set Approval For All", () => {
    it("Should Set approval For All and emit event with right arguments", async function () {
      await expect(
        MyNFTInstance.connect(addr1).setApprovalForAll(addr2.address, true)
      )
        .to.emit(MyNFTInstance, "ApprovalForAll")
        .withArgs(addr1.address, addr2.address, true);
    });
  });
  describe("Transfer From", () => {
    it("Should transfer form accout to another account and change the ownership", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await MyNFTInstance.connect(addr1).transferFrom(
        addr1.address,
        addr2.address,
        1
      );
      expect(await MyNFTInstance.balanceOf(addr1.address)).to.equal(0);
      expect(await MyNFTInstance.balanceOf(addr2.address)).to.equal(1);
      expect(await MyNFTInstance.ownerOf(1)).to.equal(addr2.address);
    });

    it("Should transfer token with non authorized account", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(
        MyNFTInstance.connect(addr2).transferFrom(
          addr1.address,
          addr2.address,
          1
        )
      ).to.be.revertedWith("not authorized");
    });

    it("Should transfer token to zero address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(
        MyNFTInstance.connect(addr1).transferFrom(
          addr1.address,
          zero_address,
          1
        )
      ).to.be.revertedWith("transfer to zero address");
    });
  });

  describe("Safe Transfer From", () => {
    it("Should safe transfer form accout to another account and change the ownership", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await MyNFTInstance.connect(addr1)[
        "safeTransferFrom(address,address,uint256)"
      ](addr1.address, addr2.address, 1);
      expect(await MyNFTInstance.balanceOf(addr1.address)).to.equal(0);
      expect(await MyNFTInstance.balanceOf(addr2.address)).to.equal(1);
      expect(await MyNFTInstance.ownerOf(1)).to.equal(addr2.address);
    });

    // it("should fail for non reciver address", async function () {
    //   await MyNFTInstance.mint(addr1.address, 1);
    //   await expect(
    //     MyNFTInstance.connect(addr1)[
    //       "safeTransferFrom(address,address,uint256)"
    //     ](addr1.address, MyNFTInstance.address, 1)
    //   ).to.be.revertedWith("unsafe recipient");
    // });

    it("should fail for non reciver address", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await expect(
        MyNFTInstance.connect(addr1)[
          "safeTransferFrom(address,address,uint256)"
        ](addr1.address, ReceiverInstance.address, 1)
      ).to.be.revertedWith("unsafe recipient");
    });
  });

  describe("Safe Transfer From with call data ", () => {
    it("Should safe transfer form accout to another account with call data and change the ownership", async function () {
      await MyNFTInstance.mint(addr1.address, 1);
      await MyNFTInstance.connect(addr1)[
        "safeTransferFrom(address,address,uint256,bytes)"
      ](addr1.address, addr2.address, 1, "0x00");
      expect(await MyNFTInstance.balanceOf(addr1.address)).to.equal(0);
      expect(await MyNFTInstance.balanceOf(addr2.address)).to.equal(1);
      expect(await MyNFTInstance.ownerOf(1)).to.equal(addr2.address);
    });
  });
});
