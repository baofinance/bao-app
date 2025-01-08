import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { useEffect, useRef, useState } from 'react'

export const useBlock = () => {
	const { library, chainId } = useWeb3React()

	const { data: blockNumber, refetch } = useQuery(
		['@/hooks/base/useBlock', providerKey(library, chainId?.toString())],
		async () => {
			if (!library) return 0
			return await library.getBlockNumber()
		},
		{
			enabled: !!library,
			refetchInterval: 12000, // Refetch every 12 seconds
		},
	)

	return {
		blockNumber: blockNumber || 0,
		refetch,
	}
}

/**
 * #### Summary
 * A hook that invokes an update callback function based on update options and ethers network state (i.e. block number)
 *
 * @param interval The number of blocks that should pass before calling the callback
 * @param callback Function to call when the proper number of blocks have passed
 * @param allowUpdate Switch the callback interval on or off
 */
export const useBlockUpdater = (callback: (() => void) | (() => Promise<void>), interval = 1, allowUpdate = true): void => {
	const { blockNumber } = useBlock()
	const updateNumberRef = useRef<number>(blockNumber)
	const [firstRender, setFirstRender] = useState(true)

	// Prevent callback on first render
	useEffect(() => {
		setFirstRender(false)
	}, [])

	useEffect(() => {
		if (!allowUpdate || firstRender) return

		// Calculate block number filter
		const blockNumberFilter = blockNumber > 0 ? Math.floor(blockNumber / interval) : undefined

		if (blockNumberFilter && blockNumberFilter !== updateNumberRef.current) {
			updateNumberRef.current = blockNumberFilter
			callback()
		}
	}, [blockNumber, interval, callback, allowUpdate, firstRender])
}

export default useBlock
