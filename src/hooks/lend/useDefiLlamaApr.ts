import { useQuery } from '@tanstack/react-query'

interface DefiLlamaAprResponse {
	data: {
		[protocol: string]: {
			apyBase?: number
			apyReward?: number
			apy?: number
		}
	}
}

type AssetAprs = {
	[key: string]: number
}

export const useDefiLlamaApr = () => {
	return useQuery<AssetAprs>(
		['@/hooks/lend/useDefiLlamaApr'],
		async () => {
			try {
				const response = await fetch('https://yields.llama.fi/pools')
				const data: DefiLlamaAprResponse = await response.json()

				// Map protocol IDs to our assets
				const aprMap: AssetAprs = {
					weETH: data.data['weETH-mainnet']?.apy || 0,
					PTweETHJUN: data.data['pendle-weeth-jun']?.apy || 0,
					PTweETHSEP: data.data['pendle-weeth-sep']?.apy || 0,
					PTweETHDEC: data.data['pendle-weeth-dec']?.apy || 0,
					BaoUSD: 0, // Add if available
					BaoETH: 0, // Add if available
				}

				return aprMap
			} catch (error) {
				console.error('Error fetching DeFi Llama APRs:', error)
				// Return default values on error
				return {
					weETH: 0,
					PTweETHJUN: 0,
					PTweETHSEP: 0,
					PTweETHDEC: 0,
					BaoUSD: 0,
					BaoETH: 0,
				}
			}
		},
		{
			refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
			staleTime: 5 * 60 * 1000,
			retry: 3,
			refetchOnWindowFocus: false,
		},
	)
}
