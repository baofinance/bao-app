import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import ExternalFarms from './components/ExternalFarms'

const Earn: React.FC = () => {
	return (
		<>
			<NextSeo title='Earn' description='Stake LP tokens to earn BAO.' />
			<div className='space-y-12'>
				<header className='lg:col-span-2 flex flex-col'>
					<Typography variant='hero' className='stroke'>
						Earn
					</Typography>
					<div className='flex gap-2 items-center'>
						<Icon icon='lightbulb' className='h-6 w-6 flex-none' />
						<Typography className='text-base font-light tracking-tight'>Stake Liquidity tokens and earn rewards</Typography>
					</div>
				</header>

				<section className='lg:col-span-3'>
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						External Farms
					</Typography>
					<Typography variant='base' className='pb-2 text-center leading-5 font-light tracking-tight'>
						Deposit synth liquidity tokens to earn rewards in our partner pools
					</Typography>
					<ExternalFarms />
				</section>
			</div>
		</>
	)
}

export default Earn
