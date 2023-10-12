import Config from '@/bao/lib/config'
import { ActiveSupportedBackstop } from '@/bao/lib/types'
import { Ctoken__factory, Erc20__factory } from '@/typechain/factories'
import { Bamm__factory } from '@/typechain/index'
import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

const useBackstops = (): ActiveSupportedBackstop[] => {
	const { account, library, chainId } = useWeb3React()

	const backstops = useMemo(() => {
		if (!library || !chainId) return []
		const signerOrProvider = account ? library.getSigner() : library
		return Config.backstops.map((backstop: any) => {
			const backstopAddress = backstop.backstopAddresses[chainId]
			const backstopContract = Bamm__factory.connect(backstopAddress, signerOrProvider)
			const vaultAddress = backstop.vaultAddresses[chainId]
			const vaultContract = Ctoken__factory.connect(vaultAddress, signerOrProvider)
			const tokenAddress = backstop.tokenAddresses[chainId]
			const tokenContract = Erc20__factory.connect(tokenAddress, signerOrProvider)
			return Object.assign(backstop, {
				backstopAddress,
				tokenAddress,
				vaultAddress,
				backstopContract,
				tokenContract,
				vaultContract,
			})
		})
	}, [library, account, chainId])

	return backstops
}

export default useBackstops
