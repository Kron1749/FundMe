const { expect, assert } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

describe("FundMe", async function () {
    let fundMe
    let deployer
    let accounts
    let mockV3Aggregator
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
            const owner = await fundMe.owner()
            assert.equal(owner, deployer)
        })
    })

    describe("Fund", async () => {
        it("")
    })
})
