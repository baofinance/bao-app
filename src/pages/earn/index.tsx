import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import ExternalFarms from './components/ExternalFarms'
import GaugeList from './components/GaugeList'

const Gauges: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Lock LP tokens to earn BAO.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Earn
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Stake Liquidity tokens and earn rewards
						</Typography>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						Revenue Share Staking
					</Typography>
					<Typography variant='base' className='pb-2 text-center leading-5 m-0 pr-1 font-light tracking-tight lg:mb-4'>
						Stake BAO liquidity tokens to earn a share of BAO buybacks from project revenue
					</Typography>
					<GaugeList />
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						External Farms
					</Typography>
					<Typography variant='base' className='pb-2 text-center leading-5 m-0 pr-1 font-light tracking-tight lg:mb-4'>
						Deposit synth liquidity tokens to earn rewards in our partner pools
					</Typography>
					<ExternalFarms />
				</div>
			</div>
		</>
	)
}

export default Gauges
