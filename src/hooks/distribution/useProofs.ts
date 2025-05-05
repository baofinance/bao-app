import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'

const useProofs = () => {
	const { account } = useWeb3React()

	const enabled = !!account
	const { data: merkleLeaf } = useQuery({
		queryKey: ['@/hooks/distribution/useProofs', { enabled, account }],

		queryFn: async () => {
			const leafResponse = await fetch(`https://bao-dist-api.herokuapp.com/${account.toLowerCase()}`)
			if (leafResponse.status !== 200) {
				const { error } = await leafResponse.json()
				throw new Error(`${error.code} - ${error.message}`)
			}
			const leaf = await leafResponse.json()
			return leaf
		},

		enabled,
		retry: false,
		staleTime: Infinity,
	})

	return merkleLeaf
}

export default useProofs
