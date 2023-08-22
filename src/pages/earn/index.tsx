import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import BackstopList from './components/BackstopList'
import ExternalFarms from './components/ExternalFarms'
import GaugeList from './components/GaugeList'

const Gauges: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Stake LP tokens to earn BAO.'} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24'>
				<div className='w-full lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Earn
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Earn rewards by staking your tokens and grow your assets while retaining full control over your investments.
						</Typography>
					</div>
					<div className='hidden lg:block'>
						<a href='https://info.bao.finance/docs/guides/gauges/depositing-lps-for-rewards' target='_blank' rel='noopener noreferrer'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<Typography variant='h3' className='pb-2 text-center font-bakbak'>
						Gauges{' '}
						<Tooltipped
							content='Gauges incentivize user participation and liquidity provision in specific pools by allocating rewards based on contributions,
						driving engagement and maximizing returns.'
						/>
					</Typography>
					<GaugeList />
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						Stability Pools{' '}
						<Tooltipped
							content='Stability Pools are the first line of defense in maintaining system solvency. They achieve this by acting as the source of
						liquidity to repay debt from liquidations.'
						/>
					</Typography>
					<BackstopList />
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						External Farms{' '}
						<Tooltipped
							content='External Farms are pools that are incentivized by other projects. They are not part of the Bao ecosystem, but are included here
							for convenience.'
						/>
					</Typography>
					<ExternalFarms />
				</div>
			</div>
		</>
	)
}

export default Gauges
