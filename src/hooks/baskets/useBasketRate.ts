import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import { getOraclePrice } from '@/bao/utils'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import type { Chainoracle, Recipe, Recipev2 } from '@/typechain/index'
import { Recipe__factory, Recipev2__factory, Chainoracle__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import Multicall from '@/utils/multicall'
import { decimate } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { Bao } from '@/bao/Bao'
import { getChainProvider } from '@/utils/getChainProvider'
import { useMemo } from 'react'

export type BasketRates = {
	eth: BigNumber
	usd: BigNumber
	dai: BigNumber
}

const useBasketRates = (basket: ActiveSupportedBasket): BasketRates => {
	const { library, account, chainId } = useWeb3React()

	// Determine which chain this basket is on
	const basketChainId = useMemo(() => {
		return Object.keys(basket.basketAddresses).map(Number)[0]
	}, [basket])

	// Get provider for the basket's chain
	const basketProvider = useMemo(() => getChainProvider(basketChainId), [basketChainId])

	// Create Bao instance for the basket's chain
	const bao = useMemo(() => {
		return new Bao(basketProvider)
	}, [basketProvider])

	// Connect contracts using the basket's chain provider
	const recipe = useMemo(() => {
		return Recipe__factory.connect(basket.recipeAddress, basketProvider)
	}, [basket.recipeAddress, basketProvider])

	const recipev2 = useMemo(() => {
		return Recipev2__factory.connect(basket.recipeAddress, basketProvider)
	}, [basket.recipeAddress, basketProvider])

	const recipeVersion = basket.recipeVersion

	// Get oracle for the basket's chain (fallback to chainId 1 if not available)
	const wethOracleAddress = Config.contracts.wethPrice[basketChainId]?.address || Config.contracts.wethPrice[1]?.address
	const wethOracle = useMemo(() => {
		if (!wethOracleAddress) return null
		return Chainoracle__factory.connect(wethOracleAddress, basketProvider)
	}, [wethOracleAddress, basketProvider])

	const enabled = !!bao && !!basketProvider && !!recipe && !!wethOracle
	const { data: rates, refetch } = useQuery(
		['@/hooks/baskets/useBasketRates', basketChainId, { enabled, nid: basket.nid }],
		async () => {
			const wethPrice = await getOraclePrice(bao, wethOracle)
			const params = [basket.address, ethers.utils.parseEther('1')]
			const query = Multicall.createCallContext([
				recipeVersion === 2
					? {
							contract: recipev2,
							ref: 'recipe',
							calls: [
								{
									method: 'getPriceUSD',
									params,
								},
								{
									method: 'getPrice',
									params,
								},
							],
						}
					: {
							contract: recipe,
							ref: 'recipe',
							calls: [
								{
									method: 'getPrice',
									params,
								},
								{
									method: 'getPriceEth',
									params,
								},
							],
						},
			])
			const { recipe: res } = Multicall.parseCallResults(await bao.multicall.call(query))
			return {
				dai: res[0].values[0],
				eth: res[1].values[0],
				usd: recipeVersion === 2 ? decimate(wethPrice.mul(res[1].values[0]).mul(100)) : decimate(wethPrice.mul(res[1].values[0]).mul(100)),
			}
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

	return rates
}

export default useBasketRates
