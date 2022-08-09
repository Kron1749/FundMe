const { expect, assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let accounts
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              accounts = await ethers.getSigners() // On local network will get 10 fake accounts
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // This will deploy everything on our local network
              fundMe = await ethers.getContract("FundMe", deployer) // Will get the recent deployment
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
          })
          describe("Constructor", async () => {
              it("Should set the aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
              it("Should set the owner correctly", async () => {
                  const owner = await fundMe.getOwner()
                  assert.equal(owner, deployer)
              })
          })

          describe("Fund", async () => {
              it("Should not deposit if amount is small", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith("FundMe__NotEnoughEth")
              })
              it("Should correctly update amount funded", async () => {
                  await fundMe.fund({ value: sendValue })
                  const amountFunded = await fundMe.getAddressToAmoundFunded(deployer)
                  assert.equal(amountFunded.toString(), sendValue.toString())
              })
              it("Should correctly add funder to funders array", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("Withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("Should not withdraw if not the owner", async () => {
                  const fundMeConnectedContract = await fundMe.connect(accounts[1])
                  await expect(fundMeConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")
              })
              it("Should withdraw from one funder", async () => {
                  //Arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

                  //Act
                  const trxResponse = await fundMe.withdraw()
                  const trxReceipt = await trxResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = trxReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                  const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance).toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("Should withdraw from all funders", async () => {
                  //Arrange

                  for (i = 1; i < 5; i++) {
                      const fundMeConnectedContract = await fundMe.connect(accounts[i])
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
                  //Act
                  const trxResponse = await fundMe.withdraw()
                  const trxReceipt = await trxResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = trxReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address) // 0
                  const endingDeployerBalance = await fundMe.provider.getBalance(deployer) // starting+starting
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance.add(startingFundMeBalance).toString()
                  )
              })
          })

          it("Should return the balance of contract", async () => {
              const balance = fundMe.provider.getBalance(fundMe.address)
              const balanceByFunction = fundMe.getBalance()
              assert.equal(balance.toString(), balanceByFunction.toString())
          })

          it("Should invoke the fallback function", async () => {
              ;[deployer1] = await ethers.getSigners()
              const tx = deployer1.sendTransaction({
                  to: fundMe.address,
                  data: "0x", // Executed with for every non-empty mismatching selector
              })
              await expect(tx).to.be.revertedWith("FundMe__NotEnoughEth")
          })
          it("Should invoke the receive function", async () => {
              ;[deployer1] = await ethers.getSigners()
              const tx = deployer1.sendTransaction({
                  to: fundMe.address,
                  data: "0x", // Executed only with empty selector
              })
              await expect(tx).to.be.revertedWith("FundMe__NotEnoughEth")
          })
      })
