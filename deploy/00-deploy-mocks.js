const { network } = require("hardhat")

const DECIMALS = "8" // Decimals in price
const INITIAL_PRICE = "200000000000" // Initial price of ETH,in USD will be 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // Deploy mocks if on local chain
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
    }
}
module.exports.tags = ["all", "mocks"]
