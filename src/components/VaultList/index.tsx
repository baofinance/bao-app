import React, { FC } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useVaults } from '@/hooks/vaults/useVaults'
import VaultCard from '@/components/VaultCard'
import { List } from '@/components/List'
import Config from '@/bao/lib/config'

// Create a single list component that reads from config
const VaultList: FC = () => {
	const { chainId } = useWeb3React()
	const vaultTypes = Object.keys(Config.vaults)

	// Get all vaults in a single hook call
	const allVaults = useVaults(vaultTypes)

	if (!chainId) return null

	return (
		<>
			{vaultTypes.map(vaultType => {
				// Filter vaults by matching their addresses with the market addresses in config
				const vaults = allVaults?.filter(vault => {
					const markets = Config.vaults[vaultType].markets
					return markets.some(market => market.vaultAddresses[chainId] === vault.vaultAddress[chainId])
				})

				return <List key={vaultType}>{vaults?.map(vault => <VaultCard key={vault.vaultAddress[chainId]} vault={vault} />)}</List>
			})}
		</>
	)
}

export default VaultList
