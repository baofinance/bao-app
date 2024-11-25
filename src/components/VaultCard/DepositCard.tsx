import React, { FC } from 'react'
import { ActiveSupportedVault } from '@/bao/lib/types'
import Typography from '@/components/Typography'

interface DepositCardProps {
	vault: ActiveSupportedVault
}

const DepositCard: FC<DepositCardProps> = ({ vault }) => {
	return (
		<div className='glassmorphic-card p-4'>
			<Typography variant='lg' className='font-bakbak'>
				{vault.symbol}
			</Typography>
			<div className='mt-2'>
				<Typography variant='sm' className='text-baoWhite/60'>
					{vault.vaultAddress[1]}
				</Typography>
			</div>
		</div>
	)
}

export default DepositCard
