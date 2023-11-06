import useContract from '@/hooks/base/useContract'
import type { GaugeController } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { readContract, fetchBlockNumber } from '@wagmi/core'
import gaugeControllerABI from '../../../src/abi/GaugeControllerABI.json'

const useRelativeWeight = async (gaugeAddress: string) => {
	const { library } = useWeb3React()

	const gaugeController = useContract<GaugeController>('GaugeController')

	if (!!library || !!gaugeController) {
		return { 0: 2 }
	}

	const gaugeControllerContract = {
		address: gaugeController.address as `0x${string}`,
		abi: gaugeControllerABI,
	}

	const block = await fetchBlockNumber()

	console.log(Number(block))

	const currentWeight = await readContract({
		...gaugeControllerContract,
		functionName: 'gauge_relative_weight',
		args: [gaugeAddress, Number(block)],
	})
	const futureWeight = await readContract({
		...gaugeControllerContract,
		functionName: 'gauge_relative_weight',
		args: [gaugeAddress, Number(block) + 604800],
	})
	return { currentWeight, futureWeight }
}

export default useRelativeWeight
