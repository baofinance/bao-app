import { useQuery } from '@tanstack/react-query'
import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

interface LlamaResponse {
	apyBase: number
	apyReward: number
}

export const useDefiLlamaApr = (marketName: string, assetAddress: string) => {
	const { data: llamaData, refetch } = useQuery(
		['@/hooks/lend/useDefiLlamaApr', { marketName, assetAddress }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const asset = market.assets.find(a => Object.values(a.underlyingAddress).includes(assetAddress))
			if (!asset?.llamaId) return null

			const response = await fetch(`https://yields.llama.fi/chart/${asset.llamaId}`)
			if (!response.ok) return null

			const data = await response.json()
			if (!data?.data?.length) return null

			const latestData = data.data[data.data.length - 1] as LlamaResponse
			return {
				apyBase: latestData.apyBase || 0,
				apyReward: latestData.apyReward || 0,
			}
		},
		{
			enabled: !!marketName && !!assetAddress,
			staleTime: 300000, // 5 minutes
			cacheTime: 600000, // 10 minutes
		},
	)

	useBlockUpdater(refetch, 100) // Update less frequently for external API
	useTxReceiptUpdater(refetch)

	return llamaData
}
