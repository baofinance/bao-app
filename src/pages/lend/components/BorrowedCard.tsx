import Card from '@/components/Card/Card'
import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import React from 'react'

export const BorrowedCard = ({ marketName, onUpdate }: { marketName: string; onUpdate: (updatedState: any) => void }) => {
	const { account } = useWeb3React()

	return (
		<>
			<Typography variant='xl' className='p-4 text-center font-bakbak'>
				Borrowed
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<div className='flex flex-col space-y-2 py-2'>
					<Typography variant='xl' className='p-4 text-center font-bakbak'>
						No assets borrowed.
					</Typography>
				</div>
			</Card>
		</>
	)
}

export default BorrowedCard
