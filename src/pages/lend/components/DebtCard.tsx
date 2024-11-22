import Typography from '@/components/Typography'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import { getDisplayBalance } from '@/utils/numberFormat'

const DashboardCard: React.FC<DashboardCardProps> = ({ marketName }: DashboardCardProps) => {
	// DEBUG: Add dummy data
	const dummyData = {
		collateral: BigNumber.from('20000000000000000000000'), // $20,000
		debt: BigNumber.from('4000000000000000000000'), // $4,000
		healthFactor: BigNumber.from('1750000000000000000'), // 1.75
		supplyYield: 250, // $250 per year
		borrowCost: 100, // $100 per year
		supplyAPR: 1.25, // 1.25%
		borrowAPR: 2.5, // Changed from borrowAPY to borrowAPR
	}

	// Use dummy data instead of real data for testing
	const totalCollateral = dummyData.collateral
	const totalDebt = dummyData.debt
	const dummyHealthFactor = dummyData.healthFactor
	const barPercentage = 20 // 20% utilization for dummy data

	// Calculate net values
	const netPositionCost = dummyData.supplyYield - dummyData.borrowCost
	const netAPR = dummyData.supplyAPR - dummyData.borrowAPR

	// Determine health bar color based on utilization
	const getHealthBarColor = (percentage: number) => {
		if (percentage < 60) return 'bg-baoGreen'
		if (percentage < 80) return 'bg-baoOrange'
		return 'bg-baoRed'
	}

	// Get text color class based on utilization
	const getTextColor = (percentage: number) => {
		if (percentage < 60) return 'text-baoGreen'
		if (percentage < 80) return 'text-baoOrange'
		return 'text-baoRed'
	}

	return (
		<div className='glassmorphic-card p-6 my-8 border border-baoRed/10 bg-baoRed/[0.15]'>
			{/* Health Bar */}
			<div className='relative w-full h-6 bg-gray-300 rounded mb-8 mt-2'>
				<div
					className={`absolute top-0 left-0 h-6 rounded ${getHealthBarColor(barPercentage)}`}
					style={{
						width: `${barPercentage}%`,
					}}
				></div>
				<div className='absolute inset-0 flex flex-col items-center justify-center'>
					<Typography variant='lg' className='font-bakbak text-baoBlack whitespace-nowrap'>
						Debt Health: {getDisplayBalance(dummyHealthFactor)}
					</Typography>
				</div>
			</div>

			<div className='flex gap-8'>
				{/* Position Info Section */}
				<div className='flex-1'>
					{/* Top Row - Collateral and Debt */}
					<div className='flex gap-4 mb-4'>
						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center py-4'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Your Collateral
								</Typography>
								<Typography variant='xl' className='font-bakbak'>
									${getDisplayBalance(totalCollateral, 18, 2)}
								</Typography>
							</div>
						</div>

						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center py-4'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Your Debt
								</Typography>
								<Typography variant='xl' className='font-bakbak'>
									${getDisplayBalance(totalDebt, 18, 2)}
								</Typography>
							</div>
						</div>
					</div>

					{/* Bottom Row - Debt Limit Used and Remaining */}
					<div className='flex gap-4'>
						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center py-4'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Debt Limit Used
								</Typography>
								<Typography variant='xl' className={`font-bakbak ${getTextColor(barPercentage)}`}>
									{barPercentage}%
								</Typography>
							</div>
						</div>

						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center py-4'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Debt Limit Remaining
								</Typography>
								<Typography variant='xl' className='font-bakbak'>
									${getDisplayBalance(totalCollateral.sub(totalDebt), 18, 2)}
								</Typography>
							</div>
						</div>
					</div>
				</div>

				{/* APR Info Section */}
				<div className='flex-1 flex flex-col gap-4'>
					{/* Top Row - Supply and Borrow side by side */}
					<div className='flex gap-4'>
						{/* Supply Yield Box */}
						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Supply Yield
								</Typography>
								<Typography variant='xl' className='font-bakbak'>
									{dummyData.supplyAPR}% APR
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 mt-1'>
									${dummyData.supplyYield}/y
								</Typography>
							</div>
						</div>

						{/* Borrow Cost Box */}
						<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
							<div className='text-center'>
								<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
									Borrow Cost
								</Typography>
								<Typography variant='xl' className='font-bakbak'>
									{dummyData.borrowAPR}% APR
								</Typography>
								<Typography variant='sm' className='text-baoWhite/60 mt-1'>
									${dummyData.borrowCost}/y
								</Typography>
							</div>
						</div>
					</div>

					{/* Bottom Row - Net Position */}
					<div className='flex-1 glassmorphic-card p-6 border border-baoRed/10'>
						<div className='text-center'>
							<Typography variant='xs' className='font-bakbak text-baoWhite/60 uppercase tracking-wider mb-2'>
								Net Position
							</Typography>
							<Typography variant='xl' className='font-bakbak'>
								{netAPR}% Net APR
							</Typography>
							<Typography variant='sm' className='text-baoWhite/60 mt-1'>
								${netPositionCost}/y
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

interface DashboardCardProps {
	marketName: string
}

export default DashboardCard
