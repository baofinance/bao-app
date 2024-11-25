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

export const useVaults = (vaultTypes: string[]): ActiveSupportedVault[] | undefined => {
	const { vaults }: VaultsContext = useContext(Context)

	if (!vaultTypes || vaultTypes.length === 0) {
		return Object.values(vaults).flat()
	}

	return vaultTypes.reduce<ActiveSupportedVault[]>((acc, vaultType) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		const vaultsOfType = vaults[vaultType] || []
		return [...acc, ...vaultsOfType]
	}, [])
}

export const useVaultsByType = (vaultType: string): ActiveSupportedVault[] | undefined => {
	return useVaults([vaultType])
}

export const useAccountVaults = (vaultName: string): ActiveSupportedVault[] | undefined => {
	const vaults = useVaultsByType(vaultName)
	const { library, account, chainId } = useWeb3React()

	const enabled = vaults?.length > 0 && !!library
	const vids = vaults?.map(vault => vault.vid)
	const { data: accountVaults, refetch } = useQuery(
		['@/hooks/vaults/useAccountVaults', providerKey(library, account, chainId), { enabled, vids, vaultName }],
		async () => {
			const comptroller = Comptroller__factory.connect(Config.vaults[vaultName].comptroller, library)
			const _accountVaults = await comptroller.getAssetsIn(account)
			return _accountVaults.map((address: string) => vaults.find(({ vaultAddress }) => vaultAddress === address))
		},
		{
			enabled,
		},
	)

	const _refetch = () => {
		if (enabled) refetch()
	}
	useBlockUpdater(_refetch, 10)
	useTxReceiptUpdater(_refetch)

	return accountVaults
}
