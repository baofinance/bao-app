import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import BackstopList from './components/BackstopList'

const Backstops: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Stake LP tokens to earn BAO.'} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						BACKSTOPS
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Backstops are the first line of defense in maintaining system solvency. They achieve this by acting as the source of liquidity
							to repay debt from liquidations.
						</Typography>
					</div>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/guides/gauges/depositing-lps-for-rewards' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<BackstopList />
				</div>
			</div>
		</>
	)
}

export default Backstops
