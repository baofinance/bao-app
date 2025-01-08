import { useWeb3React } from '@web3-react/core'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const INTEREST_RATE_MODEL_ABI = [
	'function baseRatePerBlock() external view returns (uint256)',
	'function multiplierPerBlock() external view returns (uint256)',
	'function jumpMultiplierPerBlock() external view returns (uint256)',
	'function kink() external view returns (uint256)',
]

const CTOKEN_ABI = ['function interestRateModel() external view returns (address)']

export const useInterestRateModel = (ctokenAddress: { [key: number]: string }) => {
	const { library, chainId = 1 } = useWeb3React()
	const [modelParams, setModelParams] = useState<{
		baseRate: number
		multiplier: number
		jumpMultiplier: number
		kink: number
	} | null>(null)

	useEffect(() => {
		const fetchModelParams = async () => {
			if (!library || !ctokenAddress[chainId]) return

			try {
				// First get the interest rate model address
				const cToken = new ethers.Contract(ctokenAddress[chainId], CTOKEN_ABI, library)
				const modelAddress = await cToken.interestRateModel()

				// Then get the model parameters
				const model = new ethers.Contract(modelAddress, INTEREST_RATE_MODEL_ABI, library)
				const [baseRate, multiplier, jumpMultiplier, kink] = await Promise.all([
					model.baseRatePerBlock(),
					model.multiplierPerBlock(),
					model.jumpMultiplierPerBlock(),
					model.kink(),
				])

				setModelParams({
					baseRate: Number(ethers.utils.formatUnits(baseRate, 18)),
					multiplier: Number(ethers.utils.formatUnits(multiplier, 18)),
					jumpMultiplier: Number(ethers.utils.formatUnits(jumpMultiplier, 18)),
					kink: Number(ethers.utils.formatUnits(kink, 18)),
				})
			} catch (error) {
				console.error('Error fetching interest rate model:', error)
			}
		}

		fetchModelParams()
	}, [library, chainId, ctokenAddress])

	return modelParams
}
