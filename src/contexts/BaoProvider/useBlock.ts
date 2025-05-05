import { useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
//import { useBlockNumber } from 'eth-hooks'

/**
 * #### Summary
 * Get the current block number of the network and keeps it up to date.
 * INFO: Don't use this in your hooks and components! It's just for the context.
 *	Use @/hooks/base/useBlock.
 *
 * @returns block number
 */
export const useBlock = (): number => {
	const { library, account, chainId } = useWeb3React()

	const { data: block, refetch } = useQuery({
		queryKey: ['@/hooks/base/useBlockNumber', providerKey(library, account, chainId)],

		queryFn: async () => {
			const nextBlockNumber = await library?.getBlockNumber()
			return nextBlockNumber
		},

		enabled: false,

		// manual override
		staleTime: 0,

		// one minute

		refetchOnReconnect: true,
	})

	useEffect(() => {
		if (library) {
			const listener = () => refetch()
			library?.addListener?.('block', listener)
			return () => {
				library?.removeListener?.('block', listener)
			}
		}
	}, [library, refetch])

	return block ?? 0
}

export default useBlock
