import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import { isDesktop } from 'react-device-detect'
import GaugeList from './components/GaugeList'

const Gauges: React.FC = () => {
	return (
		<>
			<NextSeo title={'Gauges'} description={'Stake LP tokens to earn BAO.'} />
			<div className='grid grid-cols-5 gap-32'>
				<div className='col-span-2'>
					<Typography variant='hero' className='stroke'>
						Gauges{' '}
					</Typography>
					<Typography variant={`${isDesktop ? 'base' : 'sm'}`} className='mb-4 font-light tracking-tight'>
						Bao Baskets allow users to get balanced exposure to digital assets on the Ethereum Network. Baskets are designed to be truly
						set-and-forget, maximizing your returns at a fraction of the cost and effort. Baskets leverage automated strategies utilizing
						staking, lending, and yield farming- No management or constant monitoring necessary!
					</Typography>
					<a href='https://info.bao.finance/docs/guides/gauges/depositing-lps-for-rewards' target='_blank' rel='noopener noreferrer'>
						<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
					</a>
				</div>
				<div className='col-span-3'>
					<GaugeList />
				</div>
			</div>
		</>
	)
}

export default Gauges
