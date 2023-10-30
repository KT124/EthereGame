const {
  time,
  loadFixture,

} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");







describe("LotteryPool", function () {
  let owner, addr1, addr2, addr3, addr4, addr5, addr6, lPool, ownerStartBal, ownerEndingBal;

  before(async () => {

    [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

    const LotteryPool = await ethers.getContractFactory("LotteryPool");
    lPool = await LotteryPool.deploy();
    // await lPool.deployed();
  })
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  // async function deployLotteryPoolFixture() {
  //   // const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  //   // const ONE_GWEI = 1_000_000_000;

  //   // const lockedAmount = ONE_GWEI;
  //   // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

  //   // Contracts are deployed using the first signer/account by default
  //   const [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

  //   const LotteryPool = await ethers.getContractFactory("LotteryPool");
  //   const lPool = await LotteryPool.deploy();

  //   return { lPool, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
  // }

  describe.only("Deployment", function () {
    it("Should set the right deployer", async function () {
      // const { lPool, owner } = await loadFixture(deployLotteryPoolFixture);

      expect(await lPool.deployer()).to.equal(owner.address);
    });

    it("Should prevent owner", async function () {
      // const { lPool } = await loadFixture(deployLotteryPoolFixture);

      await expect(lPool.enter()).to.be.revertedWith("owner not allowed");
    });

    it("Should assert deployer starting balance to be 1000", async () => {

      let provider = ethers.provider;

      ownerStartBal = await provider.getBalance(owner.address);
      console.log(`Deployer starting bal before game starts: ${ethers.formatUnits(ownerStartBal)}`);



    })

    it("Should allow addr1 to addr4", async function () {
      // const { lPool, addr1 } = await loadFixture(
      //   deployLotteryPoolFixture
      // );
      await lPool.connect(addr1).enter({ value: ethers.parseEther("0.1", "18") });
      await lPool.connect(addr2).enter({ value: ethers.parseEther("0.1", "18") });
      await lPool.connect(addr3).enter({ value: ethers.parseEther("0.1", "18") });
      await lPool.connect(addr4).enter({ value: ethers.parseEther("0.1", "18") });

      let rs = await lPool.viewParticipants();

      console.log(`pool participants: ${(rs[0].toString())}`);
      console.log(`total players: ${(rs[1].toString())}`);

      expect(rs[0][0]).to.equal(addr1.address);
      expect(rs[0][1]).to.equal(addr2.address);
      expect(rs[0][2]).to.equal(addr3.address);
      expect(rs[0][3]).to.equal(addr4.address);
      expect(rs[1]).to.equal(4);

    });

    it("Should assert pool balance to be 0.36 ether", async () => {

      let pB = await lPool.viewPoolBalance();
      console.log(`Pool bal: ${ethers.formatUnits(pB)}`);

      expect(await lPool.viewPoolBalance()).to.equal(ethers.parseEther("0.36", "18"));

    })
    it("Should assert deployer balance to be 0.04 ether", async () => {

      let pB = await lPool.viewEarnings();
      console.log(`Deployer bal: ${ethers.formatUnits(pB)}`);

      expect(await lPool.viewEarnings()).to.equal(ethers.parseEther("0.04", "18"));

    })

    it("Should disallow any of the previous addresses to call enter() again", async function () {
      // We don't use the fixture here because we want a different deployment

      await expect(lPool.connect(addr2).enter({ value: ethers.parseEther("0.1") })).to.be.revertedWith(
        "already registered"
      );
      await expect(lPool.connect(addr3).enter({ value: ethers.parseEther("0.1") })).to.be.revertedWith(
        "already registered"
      );
      await expect(lPool.connect(addr4).enter({ value: ethers.parseEther("0.1") })).to.be.revertedWith(
        "already registered"
      );
    });


    it("Should assert pool balance to be 0.36 ether after above reattempts", async () => {

      let pB = await lPool.viewPoolBalance();
      console.log(`Pool bal: ${ethers.formatUnits(pB)}`);

      expect(await lPool.viewPoolBalance()).to.equal(ethers.parseEther("0.36", "18"));

    })

    it("Should prevent deployer to call enter the game", async () => {

      await expect(lPool.enter()).to.be.revertedWith('owner not allowed');

    })

    it("Should allow the addr5 to call enter()", async () => {

      await lPool.connect(addr5).enter({ value: ethers.parseEther("0.1", "18") });

      let rs = await lPool.viewParticipants();

      console.log(`pool participants: ${(rs[0].toString())}`);
      console.log(`total players: ${(rs[1].toString())}`);
      console.log(`Result: ${rs}`);


    })

    it("Should assert pool balance to be 0.00 ether", async () => {

      let pB = await lPool.viewPoolBalance();
      console.log(`Pool bal after game over: ${ethers.formatUnits(pB)}`);

      expect(await lPool.viewPoolBalance()).to.equal(ethers.parseEther("0", "18"));

    })



    it("Should assert deployer earning to be 0.05 ether", async () => {

      let pB = await lPool.viewEarnings();
      console.log(`Deployer bal after game over: ${ethers.formatUnits(pB)}`);

      expect(await lPool.viewEarnings()).to.equal(ethers.parseEther("0.05", "18"));

    })

    it("Should assert deployer total balance to be 1000 + 0.05 ether", async () => {

      let provider = ethers.provider;

      ownerEndingBal = await provider.getBalance(owner.address);
      console.log(`Deployer bal after game over: ${ethers.formatUnits(ownerEndingBal.toString())}`);

      let netGain = ownerEndingBal - ownerStartBal;

      console.log(`Net owner earnings: ${ethers.formatEther(netGain.toString())}`)
      // expect(await provider.getBalance(owner.address)).to.equal(ethers.parseEther(tBal.toString(), "18"));

    })

    it("Should print out winner", async () => {
      let rS = await lPool.viewPreviousWinner();


      console.log(`Player ${rS} is the winnder`);


      // console.log(winner);
    })

    it("Should disallow the previous winner to enter game with less then 0.1 + 0.01 ether", async () => {
      let previousWinnder = await lPool.viewPreviousWinner();

      console.log(`Prev winnder: ${previousWinnder}`);

      await lPool.connect(addr1).enter({ value: ethers.parseUnits("0.1") });
      await expect(lPool.connect(addr2).enter({ value: ethers.parseUnits("0.1") })).to.be.revertedWith('invalid amount');
      // await lPool.connect(addr4).enter({ value: ethers.parseUnits("0.1") });
      // await lPool.connect(addr3).enter({ value: ethers.parseUnits("0.1") });
      

    })





  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
