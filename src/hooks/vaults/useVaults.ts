import Config from '@/bao/lib/config'
import { ActiveSupportedVault } from '@/bao/lib/types'
import { Context, VaultsContext } from '@/contexts/Vaults'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { Comptroller__factory } from '@/typechain/factories'
import { providerKey } from '@/utils/index'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { useContext } from 'react'

export const useVaults = (vaultName: string, includeArchived = false): ActiveSupportedVault[] | undefined => {
	const { vaults } = useContext(Context) as VaultsContext

	if (!vaults || !(vaultName in vaults)) return undefined // Safer check

	return includeArchived ? vaults[vaultName] : vaults[vaultName].filter(vault => !vault.archived)
}

export const useAccountVaults = (vaultName: string): ActiveSupportedVault[] | undefined => {
	const vaults = useVaults(vaultName)
	const { library, account, chainId } = useWeb3React()

	const enabled = vaults?.length > 0 && !!library
	const vids = vaults?.map(vault => vault.vid)
	const { data: accountVaults, refetch } = useQuery({
		queryKey: ['@/hooks/vaults/useAccountVaults', providerKey(library, account, chainId), { enabled, vids, vaultName }],

		queryFn: async () => {
			const comptroller = Comptroller__factory.connect(Config.vaults[vaultName].comptroller, library)
			const _accountVaults = await comptroller.getAssetsIn(account)
			return _accountVaults.map((address: string) => vaults.find(({ vaultAddress }) => vaultAddress === address))
		},

		enabled,
	})

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return accountVaults
}
