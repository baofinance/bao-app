import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'

export interface LockInfo {
	lockEnd: BigNumber
	lockAmount: BigNumber
	totalLocked: BigNumber
	lockEndDate: Date
	isLoading: boolean
	balance: BigNumber
}

const defaultLockInfo: LockInfo = {
	lockEnd: BigNumber.from(0),
	lockAmount: BigNumber.from(0),
	totalLocked: BigNumber.from(0),
	lockEndDate: new Date(),
	isLoading: true,
	balance: BigNumber.from(0),
}

export const useLockInfo = () => {
	const { account } = useWeb3React()
	const [lockInfo, setLockInfo] = useState<LockInfo>(defaultLockInfo)
	const isBrowser = typeof window !== 'undefined'

	useEffect(() => {
		if (!isBrowser || !account) return
		// ... existing code
	}, [account, isBrowser])

	return lockInfo
}

export default useLockInfo
