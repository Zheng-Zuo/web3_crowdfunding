import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import verify from '../utils/verify';
import {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS
} from '../helper-hardhat-config';

const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const waitBlockConfirmations = developmentChains.includes(network.name) ?
        1
        : VERIFICATION_BLOCK_CONFIRMATIONS;
    log("------------------------------------------------------------------------")
    log("")

    const args: any[] = [
        networkConfig[chainId!]['platformFeePercent'],
    ];

    // console.log(subscriptionId)
    const FundMe = await deploy('FundMe', {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    });

    log("")
    log("------------------------------------------------------------------------")
    log("")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying contract: ", FundMe.address)
        await verify(FundMe.address, args)
    }
}

export default deployFundMe;
deployFundMe.tags = ['all', 'raffle'];