import erc20Abi from '@/bao/lib/abi/erc20.json'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { Contract } from 'ethers'
import { ActiveSupportedBackstop } from '../../bao/lib/types'

const useCollaterals = (backstop: ActiveSupportedBackstop) => {
	const { library, account, chainId } = useWeb3React()

	const enabled = !!library && !!backstop && !!backstop.backstopContract
	const { data: collaterals, refetch } = useQuery(
		['@/hooks/backstops/useCollaterals', providerKey(library, account, chainId), { enabled, nid: backstop.pid }],
		async () => {
			const promises = []
			for (let i = 0; i < 10; i++) {
				const promise = backstop.backstopContract
					.collaterals(i)
					.then(address => {
						const contract = new Contract(address, erc20Abi, library)
						let balance, symbol
						if (address == '0x0000000000000000000000000000000000000000') {
							balance = library.getBalance(account)
							symbol = 'ETH'
						} else {
							balance = contract.methods.balanceOf(account).call()
							symbol = contract.methods.symbol().call()
						}
						return {
							balance: balance,
							symbol: symbol.toString(),
						}
					})
					.catch(err => null)
				promises.push(promise)
			}

			const collaterals = (await Promise.all(promises)).filter(x => x)
			return collaterals
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

	return collaterals
}

export default useCollaterals
