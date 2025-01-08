import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

export const useOraclePrice = (marketName: string, assetAddresses?: string[]): Record<string, BigNumber> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: prices, refetch } = useQuery(
		['@/hooks/lend/useOraclePrice', providerKey(library, account, chainId), { enabled, marketName, assetAddresses }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const oracle = VaultOracle__factory.connect(market.oracle, signerOrProvider)
			const addresses = assetAddresses || market.assets.map(asset => asset.ctokenAddress[chainId])

			const pricePromises = addresses.map(address => oracle.callStatic.getUnderlyingPrice(address))
			const prices = await Promise.all(pricePromises)

			return addresses.reduce(
				(acc, address, index) => {
					acc[address.toLowerCase()] = prices[index]
					return acc
				},
				{} as Record<string, BigNumber>,
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

	return prices || {}
}
