import Card from '@/components/Card/Card'
import Typography from '@/components/Typography'
import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance } from '@/bao/lib/types'

export const AssetsCard = ({ accountBalances, marketName }: { accountBalances: Balance[]; marketName: string }) => {
	return (
		<>
			<Typography variant='xl' className='p-4 text-left font-bakbak'>
				Assets
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<Card.Body>
					<SupplyList accountBalances={accountBalances} marketName={marketName} />
				</Card.Body>
			</Card>
		</>
	)
}

export default AssetsCard
