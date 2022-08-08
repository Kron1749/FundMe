const { expect, assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
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
            const response = await fundMe.s_priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
        it("Should set the owner correctly", async () => {
            const owner = await fundMe.getOwner()
            assert.equal(owner, deployer)
        })
    })

    describe("Fund", async () => {
        it("Should not deposit if amount is small", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Not enough amount in ETH")
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
})
