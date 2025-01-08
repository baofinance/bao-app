import React from 'react'
import { formatTokenAmount, formatUSD, formatPercent } from '@/utils/formatNumbers'
import { VaultAsset } from '@/bao/lib/types'
import { useSupplyRate } from '@/hooks/lend/useSupplyRate'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useWeb3React } from '@web3-react/core'

interface MarketStatsProps {
	asset: VaultAsset
	totalSupplied: number
	totalSuppliedUSD: number
	totalBorrowed: number
	totalBorrowedUSD: number
	maxLTV?: number
}

const MarketStats: React.FC<MarketStatsProps> = ({
	asset,
	totalSupplied,
	totalSuppliedUSD,
	totalBorrowed,
	totalBorrowedUSD,
	maxLTV = 90,
}) => {
	const { chainId } = useWeb3React()
	const supplyRateData = useSupplyRate(asset.name, asset.ctokenAddress, asset.llamaId)
	const borrowRates = useBorrowApy(asset.name)

	// Get the borrow rate for this specific asset
	const borrowRate = chainId && asset.underlyingAddress[chainId] ? borrowRates[asset.underlyingAddress[chainId]] : 0

	return (
		<div className='flex justify-between items-center p-4 border-b border-gray-800'>
			<div className='flex items-center gap-2 w-1/6'>
				<img src={asset.icon} alt={asset.name} className='w-8 h-8' />
				<div>
					<div className='font-semibold'>{asset.name}</div>
					{asset.supply && !asset.borrow && <div className='text-sm text-gray-400'>Collateral Only</div>}
				</div>
			</div>

			<div className='w-1/6'>
				<div>{formatTokenAmount(totalSupplied, 6)}</div>
				<div className='text-sm text-gray-400'>{formatUSD(totalSuppliedUSD)}</div>
			</div>

			<div className='w-1/6'>{supplyRateData ? formatPercent(supplyRateData.totalApy) : '-'}</div>

			<div className='w-1/6'>{maxLTV ? formatPercent(maxLTV) : '-'}</div>

			<div className='w-1/6'>
				{totalBorrowed ? (
					<>
						<div>{formatTokenAmount(totalBorrowed, 6)}</div>
						<div className='text-sm text-gray-400'>{formatUSD(totalBorrowedUSD)}</div>
					</>
				) : (
					'-'
				)}
			</div>

			<div className='w-1/6'>{borrowRate ? formatPercent(borrowRate) : '-'}</div>
		</div>
	)
}

export default MarketStats
