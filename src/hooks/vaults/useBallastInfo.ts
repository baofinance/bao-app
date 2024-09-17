import Config from '@/bao/lib/config'
import useBao from '@/hooks/base/useBao'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import useContract from '@/hooks/base/useContract'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Lusd, Stabilizer, Weth } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useEffect } from 'react'

const useBallastInfo = (vaultName: string) => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()
	const ballast = useContract<Stabilizer>('Stabilizer', Config.vaults[vaultName].stabilizer)
	const lusd = useContract<Lusd>('Lusd', Config.contracts.Lusd[chainId].address)
	const weth = useContract<Weth>('Weth', Config.contracts.Weth[chainId].address)

	const enabled = !!bao && !!library && !!ballast && !!lusd
	const { data: ballastInfo, refetch } = useQuery(
		['@/hooks/ballast/useBallastInfo', providerKey(library, account, chainId), { enabled }],
		async () => {
			const ballastQueries = Multicall.createCallContext([
				{
					ref: 'Ballast',
					contract: ballast,
					calls: [{ method: 'supplyCap' }, { method: 'buyFee' }, { method: 'sellFee' }, { method: 'FEE_DENOMINATOR' }],
				},
				{
					ref: 'LUSD',
					contract: lusd,
					calls: [{ method: 'balanceOf', params: [ballast.address] }],
				},
				{
					ref: 'WETH',
					contract: weth,
					calls: [{ method: 'balanceOf', params: [ballast.address] }],
				},
			])
			const { Ballast: ballastRes, LUSD: lusdRes, WETH: wethRes } = Multicall.parseCallResults(await bao.multicall.call(ballastQueries))

			return {
				reserves: vaultName === 'baoUSD' ? BigNumber.from(lusdRes[0].values[0]) : BigNumber.from(wethRes[0].values[0]),
				supplyCap: BigNumber.from(ballastRes[0].values[0]),
				fees: {
					buy: BigNumber.from(ballastRes[1].values[0]),
					sell: BigNumber.from(ballastRes[2].values[0]),
					denominator: BigNumber.from(ballastRes[3].values[0]),
				},
			}
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}

	useEffect(() => {
		_refetch()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [vaultName])

	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return ballastInfo
}

export default useBallastInfo
