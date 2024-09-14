import Card from '@/components/Card/Card'
import Typography from '@/components/Typography'
import React from 'react'
import SupplyList from '@/pages/lend/components/SupplyList'
import { Balance, TotalSupply } from '@/bao/lib/types'

export const AssetsCard = ({
	accountBalances,
	marketName,
	borrowBalances,
	totalSupplies,
}: {
	accountBalances: Balance[]
	marketName: string
	borrowBalances: Balance[]
	totalSupplies: TotalSupply[]
}) => {
	return (
		<>
			<Typography variant='xl' className='p-4 text-left font-bakbak'>
				Assets
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<Card.Body>
					<SupplyList
						accountBalances={accountBalances}
						borrowBalances={borrowBalances}
						totalSupplies={totalSupplies}
						marketName={marketName}
					/>
				</Card.Body>
			</Card>
		</>
	)
}

export default AssetsCard
