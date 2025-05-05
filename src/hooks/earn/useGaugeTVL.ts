import Config from '@/bao/lib/config'
import { ActiveSupportedGauge } from '@/bao/lib/types'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { BalancerComposableStablePool__factory, CurveLp__factory, SaddleLp__factory, Uni_v2_lp__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import useBao from '../base/useBao'
import useGaugeInfo from './useGaugeInfo'
import usePoolInfo from './usePoolInfo'
import useChainlinkOracle from '@/hooks/base/useChainlinkOracle'
import useBaoPrice from '@/hooks/base/useBaoPrice'
import usePrice from '@/hooks/base/usePrice'

const useGaugeTVL = (gauge: ActiveSupportedGauge) => {
	const { library } = useWeb3React()
	const bao = useBao()
	const poolInfo = usePoolInfo(gauge)
	const gaugeInfo = useGaugeInfo(gauge)
	const { price: bSTBLPrice } = useChainlinkOracle('DAI') //useVaultPrice(Config.vaults['baoUSD'].markets[1].vaultAddresses[chainId], 'baoUSD')
	const { price: baoUSDPrice } = useChainlinkOracle('DAI') //useVaultPrice(Config.vaults['baoUSD'].markets[3].vaultAddresses[chainId], 'baoUSD')
	const { price: bETHPrice } = useChainlinkOracle('ETH') // useVaultPrice(Config.vaults['baoETH'].markets[1].vaultAddresses[chainId], 'baoETH')
	const { price: baoETHPrice } = useChainlinkOracle('ETH') //useVaultPrice(Config.vaults['baoETH'].markets[2].vaultAddresses[chainId], 'baoETH')
	const { price: daiPrice } = useChainlinkOracle('DAI')
	const { price: ethPrice } = useChainlinkOracle('ETH')
	const threeCrvPrice = usePrice('ethereum:0x6c3f90f043a72fa612cbac8115ee7e52bde6e490')
	const baoPrice = useBaoPrice()
	const { price: lusdPrice } = useChainlinkOracle('LUSD')

	// const [baoUSDlusdPrice, setBaoUSDlusdPrice] = useState<BigNumber>(BigNumber.from(0))
	// const [baoETHethPrice, setBaoETHethPrice] = useState<BigNumber>(BigNumber.from(0))

	//TEMPORARY FIXES FOR BPT PRICES
	const baoUSDlusdPrice = lusdPrice && lusdPrice
	const baoETHethPrice = ethPrice && ethPrice

	const poolTVL = useMemo(() => {
		return (
			poolInfo &&
			(gauge.symbol === 'baoUSD3CRV'
				? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
					? baoUSDPrice &&
						threeCrvPrice &&
						BigNumber.from(baoUSDPrice).mul(poolInfo.token0Balance).add(BigNumber.from(threeCrvPrice).mul(poolInfo.token1Balance))
					: baoUSDPrice &&
						threeCrvPrice &&
						BigNumber.from(baoUSDPrice).mul(poolInfo.token1Balance).add(BigNumber.from(threeCrvPrice).mul(poolInfo.token0Balance))
				: gauge.symbol === 'bSTBLDAI'
					? bSTBLPrice
						? poolInfo?.token0Address.toLowerCase() === Config.addressMap.bSTBL.toLowerCase()
							? bSTBLPrice &&
								daiPrice &&
								BigNumber.from(bSTBLPrice).mul(poolInfo.token0Balance).add(BigNumber.from(daiPrice).mul(poolInfo.token1Balance))
							: bSTBLPrice &&
								daiPrice &&
								BigNumber.from(bSTBLPrice).mul(poolInfo.token1Balance).add(BigNumber.from(daiPrice).mul(poolInfo.token0Balance))
						: BigNumber.from(0)
					: gauge.symbol === 'BAOETH'
						? poolInfo?.token0Address.toLowerCase() === Config.addressMap.BAO.toLowerCase()
							? baoPrice &&
								ethPrice &&
								BigNumber.from(baoPrice).mul(poolInfo.token0Balance).add(BigNumber.from(ethPrice).mul(poolInfo.token1Balance))
							: baoPrice &&
								ethPrice &&
								BigNumber.from(baoPrice).mul(poolInfo.token1Balance).add(BigNumber.from(ethPrice).mul(poolInfo.token0Balance))
						: gauge.symbol === 'baoUSD-LUSD'
							? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
								? baoUSDPrice &&
									lusdPrice &&
									BigNumber.from(baoUSDPrice).mul(poolInfo.token0Balance).add(BigNumber.from(lusdPrice).mul(poolInfo.token1Balance))
								: baoUSDPrice &&
									lusdPrice &&
									BigNumber.from(baoUSDPrice).mul(poolInfo.token1Balance).add(BigNumber.from(lusdPrice).mul(poolInfo.token0Balance))
							: gauge.symbol === 'baoETH-ETH'
								? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoETH.toLowerCase()
									? baoETHPrice &&
										ethPrice &&
										BigNumber.from(baoETHPrice).mul(poolInfo.token0Balance).add(BigNumber.from(ethPrice).mul(poolInfo.token1Balance))
									: baoETHPrice &&
										ethPrice &&
										BigNumber.from(baoETHPrice).mul(poolInfo.token1Balance).add(BigNumber.from(ethPrice).mul(poolInfo.token0Balance))
								: gauge.symbol === 'baoUSD-LUSD/BAO'
									? poolInfo?.token0Address.toLowerCase() === Config.addressMap.BAO.toLowerCase()
										? baoUSDlusdPrice &&
											baoPrice &&
											BigNumber.from(baoUSDlusdPrice).mul(poolInfo.token0Balance).add(BigNumber.from(baoPrice).mul(poolInfo.token1Balance))
										: baoUSDlusdPrice &&
											baoPrice &&
											BigNumber.from(baoUSDlusdPrice).mul(poolInfo.token1Balance).add(BigNumber.from(baoPrice).mul(poolInfo.token0Balance))
									: gauge.symbol === 'baoETH-ETH/BAO'
										? poolInfo?.token0Address.toLowerCase() === Config.addressMap.BAO.toLowerCase()
											? baoETHethPrice &&
												baoPrice &&
												BigNumber.from(baoETHethPrice).mul(poolInfo.token0Balance).add(BigNumber.from(baoPrice).mul(poolInfo.token1Balance))
											: baoETHethPrice &&
												baoPrice &&
												BigNumber.from(baoETHethPrice).mul(poolInfo.token1Balance).add(BigNumber.from(baoPrice).mul(poolInfo.token0Balance))
										: gauge.symbol === 'baoETH-ETH/bETH'
											? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoETHETH.toLowerCase()
												? baoETHethPrice &&
													bETHPrice &&
													BigNumber.from(baoETHethPrice)
														.mul(poolInfo.token0Balance)
														.add(BigNumber.from(bETHPrice).mul(poolInfo.token1Balance))
												: baoETHethPrice &&
													bETHPrice &&
													BigNumber.from(baoETHethPrice)
														.mul(poolInfo.token1Balance)
														.add(BigNumber.from(bETHPrice).mul(poolInfo.token0Balance))
											: gauge.symbol === 'saddle-FRAXBP-baoUSD'
												? poolInfo?.token0Address.toLowerCase() === Config.addressMap.baoUSD.toLowerCase()
													? baoUSDPrice &&
														daiPrice &&
														BigNumber.from(baoUSDPrice)
															.mul(poolInfo.token0Balance)
															.add(BigNumber.from(daiPrice).mul(poolInfo.token1Balance))
													: baoUSDPrice &&
														daiPrice &&
														BigNumber.from(baoUSDPrice)
															.mul(poolInfo.token1Balance)
															.add(BigNumber.from(daiPrice).mul(poolInfo.token0Balance))
												: BigNumber.from(0))
		)
	}, [
		bETHPrice,
		bSTBLPrice,
		baoETHPrice,
		baoETHethPrice,
		baoPrice,
		baoUSDPrice,
		baoUSDlusdPrice,
		daiPrice,
		ethPrice,
		gauge.symbol,
		lusdPrice,
		poolInfo,
		threeCrvPrice,
	])

	const enabled = !!gauge && !!library && !!bao && !!poolTVL
	const { data: tvlData, refetch } = useQuery({
		queryKey: ['@/hooks/gauges/useGaugeTVL', providerKey(library), { enabled, gid: gauge.gid, poolTVL }],

		queryFn: async () => {
			const curveLpContract = CurveLp__factory.connect(gauge.lpAddress, library)
			const uniLpContract = Uni_v2_lp__factory.connect(gauge.lpAddress, library)
			const saddleLpContract = SaddleLp__factory.connect(gauge.lpAddress, library)
			const balancerComposableStablePool = BalancerComposableStablePool__factory.connect(gauge.lpAddress, library)
			const query = Multicall.createCallContext([
				gauge.type.toLowerCase() === 'curve'
					? {
							contract: curveLpContract,
							ref: gauge?.lpAddress,
							calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
						}
					: gauge.type.toLowerCase() === 'uniswap'
						? {
								contract: uniLpContract,
								ref: gauge?.lpAddress,
								calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
							}
						: gauge.type.toLowerCase() === 'balancer'
							? {
									contract: balancerComposableStablePool,
									ref: gauge?.lpAddress,
									calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'getActualSupply' }],
								}
							: {
									contract: saddleLpContract,
									ref: gauge?.lpAddress,
									calls: [{ method: 'balanceOf', params: [gauge?.gaugeAddress] }, { method: 'totalSupply' }],
								},
			])
			const { [gauge?.lpAddress]: res0 } = Multicall.parseCallResults(await bao.multicall.call(query))

			const gaugeBalance = res0[0].values[0]
			const totalSupply = res0[1].values[0]
			const lpPrice = poolTVL && poolTVL.div(totalSupply)
			// const setLpPrice =
			// 	gauge.symbol === 'baoUSD-LUSD/BAO'
			// 		? setBaoUSDlusdPrice(lpPrice)
			// 		: gauge.symbol === 'baoETH-ETH/BAO'
			// 		? setBaoETHethPrice(lpPrice)
			// 		: gauge.symbol === 'bETH/baoETH-ETH'
			// 		? setBaoETHethPrice(lpPrice)
			// 		: null

			const gaugeTVL = lpPrice && lpPrice.mul(gaugeBalance)
			const depositAmount = lpPrice && gaugeInfo && lpPrice.mul(gaugeInfo.balance)

			return { gaugeTVL, depositAmount }
		},

		enabled,
		placeholderData: { gaugeTVL: BigNumber.from(0), depositAmount: BigNumber.from(0) },
	})

	const _refetch = () => {
		if (enabled) refetch()
	}
	useTxReceiptUpdater(_refetch)
	useBlockUpdater(_refetch, 10)

	return tvlData
}

export default useGaugeTVL
