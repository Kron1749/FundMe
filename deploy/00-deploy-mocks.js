const { network } = require("hardhat")
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

module.exports = async (hre) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //Creating fake price feed for our local development
    if (chainId == "31337") {
        log("Detected local network,waiting for mocks deploying")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed")
    }
}

module.exports.tags = ["all", "mocks"] // when run "yarn hardhat deploy" will work only with these tags
