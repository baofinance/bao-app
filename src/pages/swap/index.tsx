import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import { Icon } from '@/components/Icon'
import SwapList from '@/pages/swap/components/SwapList'

const Swap: React.FC = () => {
	return (
		<div className='max-w-3xl mx-auto'>
			<NextSeo title={'Swap'} description={'Swap native BAO tokens using the LlamaSwap aggregator.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Swap
					</Typography>
					<div className='!mt-0 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Swap native BAO tokens using the LlamaSwap aggregator.
						</Typography>
					</div>
					<div className='flex lg:block mr-auto !mt-3'>
						<a
							className='mr-auto'
							href='https://info.bao.finance/docs/guides/bao-markets/ballast'
							target='_blank'
							rel='noopener noreferrer'
						>
							<button className='glassmorphic-card px-4 py-2 font-bakbak border-baoRed hover:bg-baoRed'>Learn More</button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<SwapList />
				</div>
			</div>
		</div>
	)
}

export default Swap
