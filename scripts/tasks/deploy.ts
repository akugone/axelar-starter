import { setDeploymentAddress } from '../../.deployment/deploymentManager'
import { task } from 'hardhat/config'
import { verifyAddress } from '../../utils/verifyAddress'
import dotenv from 'dotenv'
dotenv.config()

const GatewayContract = process.env.GATEWAY_CONTRACT || ''
const GasReceiverContract = process.env.GASRECEIVER_CONTRACT || ''
const ChainName = process.env.ChainName || ''

task('deploy', 'Deploy all contracts')
  .addFlag('verify', 'verify contracts on etherscan')
  .setAction(async (args, { ethers, network }) => {
    const { verify } = args
    console.log('Network:', network.name)

    const [deployer] = await ethers.getSigners()
    console.log('Using address: ', deployer.address)

    const balance = await ethers.provider.getBalance(deployer.address)
    console.log('Balance: ', ethers.utils.formatEther(balance))

    const Axelar = await ethers.getContractFactory('Axelar')
    const axelarArg: [string, string, string] = [GatewayContract, GasReceiverContract, ChainName]
    const axelar = await Axelar.deploy(...axelarArg)

    await axelar.deployed()

    if (verify) {
      await verifyAddress(axelar.address, axelarArg)
    }

    console.log('Deployed Axelar at', axelar.address)
    setDeploymentAddress(network.name, 'Axelar', axelar.address)
  })
