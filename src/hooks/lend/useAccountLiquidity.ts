import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Comptroller__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

interface AccountLiquidity {
	liquidity: BigNumber
	shortfall: BigNumber
}

export const useAccountLiquidity = (marketName: string): AccountLiquidity => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: liquidity, refetch } = useQuery(
		['@/hooks/lend/useAccountLiquidity', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const comptroller = Comptroller__factory.connect(market.comptroller, library)
			const [err, liq, shortfall] = await comptroller.getAccountLiquidity(account)

			if (err.gt(0)) {
				throw new Error('Error getting account liquidity')
			}

			return {
				liquidity: liq,
				shortfall,
			}
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return liquidity || { liquidity: BigNumber.from(0), shortfall: BigNumber.from(0) }
}

export default useAccountLiquidity
