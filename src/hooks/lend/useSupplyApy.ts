import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import { Ctoken__factory } from '@/typechain/factories'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

const BLOCKS_PER_DAY = 7200 // ~12 seconds per block
const DAYS_PER_YEAR = 365

const calculateApy = (ratePerBlock: BigNumber): number => {
	const ratePerDay = Number(ratePerBlock.toString()) * BLOCKS_PER_DAY
	return (Math.pow(1 + ratePerDay / 1e18, DAYS_PER_YEAR) - 1) * 100
}

export const useSupplyApy = (marketName: string): Record<string, number> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: apys, refetch } = useQuery(
		['@/hooks/lend/useSupplyApy', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const tokens = market.assets.map(asset => asset.ctokenAddress[chainId])
			const contracts: Contract[] = tokens.map(address => Ctoken__factory.connect(address, library))

			const res = MultiCall.parseCallResults(
				await bao.multicall.call(
					MultiCall.createCallContext(
						contracts.map(contract => ({
							ref: contract.address,
							contract,
							calls: [{ method: 'supplyRatePerBlock' }],
						})),
					),
				),
			)

			return Object.keys(res).reduce(
				(acc, address) => {
					const asset = market.assets.find(asset => asset.ctokenAddress[chainId].toLowerCase() === address.toLowerCase())
					if (!asset) throw new Error(`Asset not found for address ${address}`)

					acc[asset.underlyingAddress[chainId]] = calculateApy(res[address][0].values[0])
					return acc
				},
				{} as Record<string, number>,
			)
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return apys || {}
}
