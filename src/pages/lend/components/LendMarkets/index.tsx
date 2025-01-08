import { formatUSD, formatTokenAmount, formatPercent } from '@/utils/formatNumbers'

interface MarketRowProps {
	asset: any
	totalSupplied: number
	totalSuppliedUSD: number
	supplyAPY: number
	maxLTV: number
	totalBorrowed: number
	borrowAPR: number
}

const MarketRow: FC<MarketRowProps> = ({ asset, totalSupplied, totalSuppliedUSD, supplyAPY, maxLTV, totalBorrowed, borrowAPR }) => {
	return (
		<tr className='border-t border-gray-800'>
			<td className='flex items-center gap-2 py-4'>
				<img src={asset.icon} alt={asset.name} className='w-8 h-8' />
				<div>
					<div>{asset.name}</div>
					<div className='text-gray-500'>Collateral Only</div>
				</div>
			</td>
			<td>
				<div>{formatTokenAmount(totalSupplied)}</div>
				<div className='text-gray-500'>{formatUSD(totalSuppliedUSD)}</div>
			</td>
			<td>{formatPercent(supplyAPY)}</td>
			<td>{formatPercent(maxLTV)}</td>
			<td>
				{totalBorrowed ? (
					<>
						<div>{formatTokenAmount(totalBorrowed)}</div>
						<div className='text-gray-500'>{formatUSD(totalBorrowedUSD)}</div>
					</>
				) : (
					'-'
				)}
			</td>
			<td>{borrowAPR ? formatPercent(borrowAPR) : '-'}</td>
		</tr>
	)
}
