import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export const useOraclePrice = (marketName: string, assetAddresses?: string[]): Record<string, BigNumber> => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: prices, refetch } = useQuery(
		['@/hooks/lend/useOraclePrice', providerKey(library, account, chainId), { enabled, marketName, assetAddresses }],
		async () => {
			const oracle = VaultOracle__factory.connect(Config.lendMarkets[marketName].oracle, signerOrProvider)
			const addresses = assetAddresses || [Config.lendMarkets[marketName].marketAddresses[chainId]]

			const pricePromises = addresses.map(address => oracle.callStatic.getUnderlyingPrice(address))
			const prices = await Promise.all(pricePromises)

			return addresses.reduce(
				(acc, address, index) => {
					acc[address] = prices[index]
					return acc
				},
				{} as Record<string, BigNumber>,
			)
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useTxReceiptUpdater(_refetch)

	return prices || {}
}
