import Typography from '@/components/Typography'
import React from 'react'
import { Icon } from '@/components/Icon'
import { Interface } from './components/Interface'
import { NextSeo } from 'next-seo'

const Stake: React.FC = () => {
	return (
		<div className='max-w-xl mx-auto'>
			<NextSeo title={'Stake'} description={'Stake bao synthetic tokens to earn yield.'} />
			<div className='lg:col-span-2 flex flex-wrap flex-col'>
				<Typography variant='hero' className='stroke'>
					Stake
				</Typography>
				<div className='!mt-0 flex gap-2'>
					<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
					<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
						Stake bao synthetic tokens to earn yield.
					</Typography>
				</div>
				<div className='flex lg:block mr-auto !mt-3'>
					<a className='mr-auto' href='https://info.bao.finance/docs/guides/bao-markets/ballast' target='_blank' rel='noopener noreferrer'>
						<button className='glassmorphic-card px-4 py-2 font-bakbak border-baoRed hover:bg-baoRed'>Learn More</button>
					</a>
				</div>
				<Interface />
			</div>
		</div>
	)
}

export default Stake
