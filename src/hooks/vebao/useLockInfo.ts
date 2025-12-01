import Multicall from '@/utils/multicall'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import useBao from '../base/useBao'
import Config from '@/bao/lib/config'
import useContract from '@/hooks/base/useContract'
import type { VotingEscrow } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'

export type LockInfo = {
	balance: BigNumber
	lockAmount: BigNumber
	lockEnd: BigNumber
}

const useLockInfo = (): LockInfo | undefined => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const votingEscrowContract = chainId && Config.contracts.votingEscrow?.[chainId]
	const votingEscrow = useContract<VotingEscrow>(
		'VotingEscrow',
		votingEscrowContract?.address || (chainId === 1 ? Config.contracts.votingEscrow[1]?.address : undefined),
	)

	// FIXME: let us get the totalSupply and supply without needing an account.
	const enabled = !!bao && !!account && !!votingEscrow && !!votingEscrowContract
	const { data: lockInfo, refetch } = useQuery(
		['@/hooks/vebao/useLockInfo', providerKey(library, account, chainId), { enabled }],
		async () => {
			const query = Multicall.createCallContext([
				{
					contract: votingEscrow,
					ref: 'votingEscrow',
					calls: [
						{
							method: 'balanceOf(address)',
							params: [account],
						},
						{
							method: 'locked(address)',
							params: [account],
						},
					],
				},
			])

			const { votingEscrow: res } = Multicall.parseCallResults(await bao.multicall.call(query))

			return {
				balance: res[0].values[0],
				lockAmount: res[1].values[0],
				lockEnd: res[1].values[1],
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return lockInfo
}

export default useLockInfo
