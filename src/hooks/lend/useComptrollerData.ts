import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Comptroller__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

interface ComptrollerData {
	assetsIn: string[]
	isEntered: boolean
}

export const useComptrollerData = (marketName: string): ComptrollerData => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName
	const { data: comptrollerData, refetch } = useQuery(
		['@/hooks/lend/useComptrollerData', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const comptroller = Comptroller__factory.connect(market.comptroller, library)
			const assetsIn = await comptroller.getAssetsIn(account)
			const isEntered = assetsIn.length > 0

			return {
				assetsIn,
				isEntered,
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

	return comptrollerData || { assetsIn: [], isEntered: false }
}
