import React from 'react'
import { VaultAsset } from '@/bao/lib/types'
import MarketStats from './MarketStats'

interface MarketListProps {
	marketName: string
	assets: VaultAsset[]
	marketTotals: {
		[key: string]: {
			totalSupplied: number
			totalSuppliedUSD: number
			totalBorrowed: number
			totalBorrowedUSD: number
			maxLTV?: number
		}
	}
}

const MarketList: React.FC<MarketListProps> = ({ marketName, assets, marketTotals }) => {
	return (
		<div>
			{/* Header - No borders or background */}
			<div className='grid grid-cols-6 gap-4 px-4 py-2'>
				<div className='text-gray-400'>Asset</div>
				<div className='text-gray-400'>Total Supplied</div>
				<div className='text-gray-400 text-center'>Supply APY</div>
				<div className='text-gray-400 text-center'>Max LTV</div>
				<div className='text-gray-400'>Total Borrowed</div>
				<div className='text-gray-400 text-center'>Borrow APR</div>
			</div>

			{/* Asset List */}
			<div>
				{assets.map(asset => {
					const totals = marketTotals[asset.name] || {
						totalSupplied: 0,
						totalSuppliedUSD: 0,
						totalBorrowed: 0,
						totalBorrowedUSD: 0,
						maxLTV: 0,
					}

					return (
						<MarketStats
							key={asset.name}
							asset={asset}
							totalSupplied={totals.totalSupplied}
							totalSuppliedUSD={totals.totalSuppliedUSD}
							totalBorrowed={totals.totalBorrowed}
							totalBorrowedUSD={totals.totalBorrowedUSD}
							maxLTV={totals.maxLTV}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default MarketList
