import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Ctoken__factory, Cether__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { Erc20__factory } from '@/typechain/factories/Erc20__factory'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useActiveLendMarket = (marketName: string) => {
	const { library, chainId } = useWeb3React()

	const enabled = !!library && !!chainId && !!marketName
	const { data: activeMarket, refetch } = useQuery(
		['@/hooks/lend/useActiveLendMarket', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			return market.assets.map(asset => {
				const ctokenAddress = asset.ctokenAddress[chainId]
				const underlyingAddress = asset.underlyingAddress[chainId]

				const ctokenContract =
					underlyingAddress === 'ETH' ? Cether__factory.connect(ctokenAddress, library) : Ctoken__factory.connect(ctokenAddress, library)

				const underlyingContract = underlyingAddress === 'ETH' ? undefined : Erc20__factory.connect(underlyingAddress, library)

				return {
					ctokenAddress,
					ctokenContract,
					underlyingAddress,
					underlyingContract,
				}
			})
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return activeMarket
}
