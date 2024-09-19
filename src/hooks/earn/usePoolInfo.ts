import Config from '@/bao/lib/config'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { PoolInfo__factory, SaddlePool__factory, Uni_v2_lp__factory, BalancerVault__factory } from '@/typechain/index'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { ActiveSupportedGauge } from '../../bao/lib/types'
import useBao from '../base/useBao'

type PoolInfoTypes = {
	token0Address: string
	token1Address: string
	token0Decimals: BigNumber
	token1Decimals: BigNumber
	token0Balance: BigNumber
	token1Balance: BigNumber
}

const usePoolInfo = (gauge: ActiveSupportedGauge): PoolInfoTypes => {
	const bao = useBao()
	const { library, account, chainId } = useWeb3React()

	const enabled = !!bao && !!library && !!gauge

	const { data: poolInfo, refetch } = useQuery(
		['@/hooks/gauges/usePoolInfo', providerKey(library, account, chainId), { enabled, gid: gauge.gid }],
		async () => {
			const poolAddress = gauge.poolAddresses[chainId]
			const poolInfoAddress = gauge.poolInfoAddresses[chainId]
			const gaugeType = gauge.type.toLowerCase()

			const poolInfoContract = PoolInfo__factory.connect(poolInfoAddress, library)
			const univ2LpContract = Uni_v2_lp__factory.connect(poolAddress, library)
			const saddlePoolContract = SaddlePool__factory.connect(poolAddress, library)
			const balancerVault = BalancerVault__factory.connect(Config.contracts.BalancerVault[chainId].address, library)

			const multicallContext = []

			switch (gaugeType) {
				case 'curve':
					multicallContext.push({
						contract: poolInfoContract,
						ref: gauge.poolAddress,
						calls: [
							{ method: 'get_coins', params: [gauge.poolAddress] },
							{ method: 'get_decimals', params: [gauge.poolAddress] },
							{ method: 'get_balances', params: [gauge.poolAddress] },
						],
					})
					break
				case 'uniswap':
					multicallContext.push({
						contract: univ2LpContract,
						ref: gauge.lpAddress,
						calls: [{ method: 'getReserves' }, { method: 'token0' }, { method: 'token1' }],
					})
					break
				case 'balancer':
					multicallContext.push({
						contract: balancerVault,
						ref: gauge.poolAddress,
						calls: [{ method: 'getPoolTokens', params: [gauge.balancerPoolId] }],
					})
					break
				case 'saddle':
				default:
					multicallContext.push({
						contract: saddlePoolContract,
						ref: gauge.poolAddress,
						calls: [
							{ method: 'getToken', params: ['0'] },
							{ method: 'getTokenBalance', params: ['0'] },
							{ method: 'getToken', params: ['1'] },
							{ method: 'getTokenBalance', params: ['1'] },
						],
					})
					break
			}

			const callContext = Multicall.createCallContext(multicallContext)
			const callResults = await bao.multicall.call(callContext)
			const parsedResults = Multicall.parseCallResults(callResults)
			const res = parsedResults[gauge.poolAddress || gauge.lpAddress]

			// Helper functions to parse results based on gauge type
			const parseCurveResults = (res: { values: any[] }[]) => ({
				token0Address: res[0].values[0].toString(),
				token1Address: res[0].values[1].toString(),
				token0Decimals: BigNumber.from(res[1].values[0]),
				token1Decimals: BigNumber.from(res[1].values[1]),
				token0Balance: BigNumber.from(res[2].values[0]),
				token1Balance: BigNumber.from(res[2].values[1]),
			})

			const parseUniswapResults = (res: { values: any[] }[]) => ({
				token0Address: res[1].values[0],
				token1Address: res[2].values[0],
				token0Decimals: BigNumber.from(18),
				token1Decimals: BigNumber.from(18),
				token0Balance: BigNumber.from(res[0].values[0]), // reserve0
				token1Balance: BigNumber.from(res[0].values[1]), // reserve1
			})

			const parseBalancerResults = (res: { values: any[] }[]) => {
				const poolTokens = res[0].values[0]
				const balances = res[0].values[1]
				let token0Address = ''
				let token1Address = ''
				let token0Balance = BigNumber.from(0)
				let token1Balance = BigNumber.from(0)

				if (poolTokens[0].toString() === gauge.poolAddress) {
					if (poolTokens[1].toString() === gauge.poolAddress) {
						token0Address = poolTokens[2].toString()
						token0Balance = BigNumber.from(balances[2])
						token1Address = poolTokens[0].toString()
						token1Balance = BigNumber.from(balances[0])
					} else {
						token0Address = poolTokens[1].toString()
						token0Balance = BigNumber.from(balances[1])
						token1Address = poolTokens[0].toString()
						token1Balance = BigNumber.from(balances[0])
					}
				} else {
					token0Address = poolTokens[0].toString()
					token0Balance = BigNumber.from(balances[0])
					token1Address = poolTokens[1].toString()
					token1Balance = BigNumber.from(balances[1])
				}

				return {
					token0Address,
					token1Address,
					token0Decimals: BigNumber.from(18),
					token1Decimals: BigNumber.from(18),
					token0Balance,
					token1Balance,
				}
			}

			const parseSaddleResults = (res: { values: any[] }[]) => ({
				token0Address: res[0]?.values[0] || '',
				token0Balance: BigNumber.from(res[1]?.values[0] || 0),
				token1Address: res[2]?.values[0] || '',
				token1Balance: BigNumber.from(res[3]?.values[0] || 0),
				token0Decimals: BigNumber.from(18),
				token1Decimals: BigNumber.from(18),
			})

			// Parse results based on gauge type
			const result = (() => {
				switch (gaugeType) {
					case 'curve':
						return parseCurveResults(res)
					case 'uniswap':
						return parseUniswapResults(res)
					case 'balancer':
						return parseBalancerResults(res)
					case 'saddle':
					default:
						return parseSaddleResults(res)
				}
			})()

			return result
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)
	return poolInfo
}

export default usePoolInfo
