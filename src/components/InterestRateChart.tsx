import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import Typography from '@/components/Typography'

interface InterestRateChartProps {
	baseRate: number
	multiplier: number
	jumpMultiplier: number
	kink: number
}

export const InterestRateChart: React.FC<InterestRateChartProps> = ({ baseRate, multiplier, jumpMultiplier, kink }) => {
	// Generate data points for the chart
	const data = Array.from({ length: 101 }, (_, i) => {
		const utilization = i / 100
		let rate
		if (utilization <= kink) {
			rate = baseRate + utilization * multiplier
		} else {
			const normalRate = baseRate + kink * multiplier
			const excessUtil = utilization - kink
			rate = normalRate + excessUtil * jumpMultiplier
		}
		return {
			utilization: utilization * 100,
			rate: rate * 100,
		}
	})

	return (
		<div className='w-[300px] h-[200px] p-4 bg-gray-900 rounded-lg'>
			<Typography variant='sm' className='mb-2 text-center'>
				Interest Rate Model
			</Typography>
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart data={data}>
					<XAxis dataKey='utilization' label={{ value: 'Utilization %', position: 'bottom' }} domain={[0, 100]} />
					<YAxis label={{ value: 'Borrow APR %', angle: -90, position: 'left' }} domain={[0, 'auto']} />
					<RechartsTooltip
						formatter={(value: number) => `${value.toFixed(2)}%`}
						labelFormatter={(label: number) => `Utilization: ${label.toFixed(2)}%`}
						contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
					/>
					<Line type='monotone' dataKey='rate' stroke='#ff4d4d' dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}
