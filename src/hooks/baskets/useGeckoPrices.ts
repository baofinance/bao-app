import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { useBlockUpdater } from '@/hooks/base/useBlock'

import useBaskets from './useBaskets'

type Prices = { [address: string]: BigNumber }
type AddressMap = { [defiLlamaKey: string]: string }

const useGeckoPrices = (): Prices => {
	const { library, account, chainId } = useWeb3React()
	const baskets = useBaskets()

	const enabled = !!library && !!baskets
	const nids = baskets.map(b => b.nid)
	const { data: prices, refetch } = useQuery(
		['@/hooks/baskets/useGeckoPrices', providerKey(library, account, chainId), { enabled, nids }],
		async () => {
			// Create array of contract addresses to query in DefiLlama format
			const contractAddresses = baskets.reduce((prev, basket) => {
				// Get all the addresses from the cgIds object
				const addresses = Object.keys(basket.cgIds)
				// Map each address to ethereum:{address} format for DefiLlama
				const formattedAddresses = addresses.map(address => `ethereum:${address.toLowerCase()}`)
				return [...prev, ...formattedAddresses]
			}, [] as string[])

			// Join all addresses with comma for DefiLlama query
			const addressesToQuery = contractAddresses.join(',')

			// Map addresses from cgIds to their original keys for return values
			const addressMap: AddressMap = baskets.reduce((prev, basket) => {
				const addresses = Object.keys(basket.cgIds)
				const mapping = addresses.reduce(
					(p, address) => ({ ...p, [`ethereum:${address.toLowerCase()}`]: address.toLowerCase() }),
					{} as AddressMap,
				)
				return { ...prev, ...mapping }
			}, {} as AddressMap)

			// Query DefiLlama API
			const res = await (await fetch(`https://coins.llama.fi/prices/current/${addressesToQuery}`)).json()

			// Map response back to the original format
			return Object.keys(res.coins || {}).reduce((prev, cur) => {
				const originalAddress = addressMap[cur]
				if (!originalAddress || !res.coins[cur]?.price) return prev
				return { ...prev, [originalAddress]: parseUnits(res.coins[cur].price.toString()) }
			}, {} as Prices)
		},
		{ enabled, staleTime: 1000 * 60 * 60, cacheTime: 1000 * 60 * 120, refetchOnReconnect: true },
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return prices
}

export default useGeckoPrices
