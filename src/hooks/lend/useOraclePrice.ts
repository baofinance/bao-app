import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { VaultOracle__factory } from '@/typechain/factories'
import Config from '@/bao/lib/config'
import { BigNumber } from 'ethers'

export const useOraclePrice = (marketName: string): BigNumber => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()
	const signerOrProvider = account ? library.getSigner() : library

	const enabled = !!bao && !!account && !!chainId
	const { data: price } = useQuery(
		['@/hooks/lend/useOraclePrice', providerKey(library, account, chainId), { enabled }],
		async () => {
			const oracle = VaultOracle__factory.connect(Config.lendMarkets[marketName].oracle, signerOrProvider)
			const address = Config.lendMarkets[marketName].marketAddresses[chainId]

			return await oracle.callStatic.getUnderlyingPrice(address)
		},
		{
			enabled,
		},
	)

	return price
}
