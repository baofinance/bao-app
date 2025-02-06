import { useWeb3React } from '@web3-react/core'
import { useEffect, useState, useMemo } from 'react'
import { Contract, BigNumber } from 'ethers'
import { CTOKEN_ABI } from '@/bao/lib/abi'
import { useDefiLlamaApy } from './useDefiLlamaApy'
import Config from '@/bao/lib/config'

const BLOCKS_PER_YEAR = 2628000 // 365 days * 7200 blocks per day

interface AddressWithLlamaId {
	ctokenAddress: { [key: number]: string }
	llamaId?: string
}

interface SupplyRate {
	totalApy: BigNumber
	lendingApy: BigNumber
	underlyingApy: BigNumber
}

// Maximum number of assets we expect to handle
const MAX_ASSETS = 10

export const useSupplyRates = (addresses: AddressWithLlamaId[], marketName: string) => {
	const { library, chainId = Config.networkId } = useWeb3React()
	const [rates, setRates] = useState<{ [key: string]: SupplyRate }>({})

	// Pre-fill the addresses array with undefined values up to MAX_ASSETS
	const paddedAddresses = useMemo(() => {
		const padded = [...addresses]
		while (padded.length < MAX_ASSETS) {
			padded.push({ ctokenAddress: {}, llamaId: undefined })
		}
		return padded
	}, [addresses])

	// Create a fixed number of hooks
	const apy0 = useDefiLlamaApy(paddedAddresses[0]?.llamaId)
	const apy1 = useDefiLlamaApy(paddedAddresses[1]?.llamaId)
	const apy2 = useDefiLlamaApy(paddedAddresses[2]?.llamaId)
	const apy3 = useDefiLlamaApy(paddedAddresses[3]?.llamaId)
	const apy4 = useDefiLlamaApy(paddedAddresses[4]?.llamaId)
	const apy5 = useDefiLlamaApy(paddedAddresses[5]?.llamaId)
	const apy6 = useDefiLlamaApy(paddedAddresses[6]?.llamaId)
	const apy7 = useDefiLlamaApy(paddedAddresses[7]?.llamaId)
	const apy8 = useDefiLlamaApy(paddedAddresses[8]?.llamaId)
	const apy9 = useDefiLlamaApy(paddedAddresses[9]?.llamaId)

	const llamaApys = [apy0, apy1, apy2, apy3, apy4, apy5, apy6, apy7, apy8, apy9]

	useEffect(() => {
		if (!library || !chainId || !addresses.length) return

		const fetchRates = async () => {
			const newRates: { [key: string]: SupplyRate } = {}

			for (let i = 0; i < addresses.length; i++) {
				const asset = addresses[i]
				if (!asset.ctokenAddress[chainId]) continue

				try {
					const contract = new Contract(asset.ctokenAddress[chainId], CTOKEN_ABI, library)
					const supplyRatePerBlock = await contract.supplyRatePerBlock()
					const ratePerBlock = Number(supplyRatePerBlock.toString()) / 1e18
					const lendingApy = BigNumber.from(Math.floor((Math.pow(1 + ratePerBlock, BLOCKS_PER_YEAR) - 1) * 1e18))

					const underlyingApy = llamaApys[i] || 0
					const underlyingApyBN = BigNumber.from(Math.floor(underlyingApy * 1e16))

					newRates[asset.ctokenAddress[chainId]] = {
						totalApy: lendingApy.add(underlyingApyBN),
						lendingApy,
						underlyingApy: underlyingApyBN,
					}
				} catch (e) {
					console.error('Error fetching supply rate:', e)
				}
			}

			setRates(newRates)
		}

		fetchRates()
	}, [library, chainId, addresses, marketName, ...llamaApys])

	return rates
}
