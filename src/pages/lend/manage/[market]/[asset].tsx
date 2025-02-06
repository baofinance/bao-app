import { useRouter } from 'next/router'
import React from 'react'

const ManagePosition: React.FC = () => {
	const router = useRouter()
	const { market, asset } = router.query

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-2xl font-bold mb-6'>
				Manage {asset} Position in {market} Market
			</h1>
			{/* Add your position management UI here */}
		</div>
	)
}

export default ManagePosition
