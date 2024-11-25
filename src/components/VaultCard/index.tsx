import React, { FC } from 'react'
import { ActiveSupportedVault } from '@/bao/lib/types'
import DepositCard from './DepositCard'

interface VaultCardProps {
	vault: ActiveSupportedVault
}

const VaultCard: FC<VaultCardProps> = ({ vault }) => {
	return <DepositCard vault={vault} />
}

export default VaultCard
