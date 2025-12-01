import Config from '@/bao/lib/config'
import { ActiveSupportedBasket } from '@/bao/lib/types'
import { Experipie__factory, Oven__factory, SimpleUniRecipe__factory } from '@/typechain/factories'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'
import { getChainProvider } from '@/utils/getChainProvider'

const useBaskets = (): ActiveSupportedBasket[] => {
	const { chainId, library, account } = useWeb3React()

	const baskets = useMemo(() => {
		// Return all baskets, connecting contracts using the appropriate provider for each chain
		const bs = Config.baskets
			.map(basket => {
				// Find which chain this basket is on
				const basketChainId = Object.keys(basket.basketAddresses).map(Number)[0]
				const address = basket.basketAddresses[basketChainId]

				if (!address) return null

				// Use the provider for the basket's chain
				const provider = getChainProvider(basketChainId)
				// Only use signer if user is on the same chain as the basket
				const signerOrProvider = account && basketChainId === chainId ? library?.getSigner() : provider

				const basketContract = Experipie__factory.connect(address, signerOrProvider)
				const recipeContract = SimpleUniRecipe__factory.connect(basket.recipeAddress, signerOrProvider)
				const ovenContract = Oven__factory.connect(basket.ovenAddress, signerOrProvider)
				return Object.assign(basket, { address, basketContract, recipeContract, ovenContract })
			})
			.filter(Boolean) as ActiveSupportedBasket[]

		return bs
	}, [library, account, chainId])

	return baskets
}

export default useBaskets
