import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import BallastCard from '../ballast/components/Ballast'
import { Icon } from '@/components/Icon'
import SwapList from '@/pages/swap/components/SwapList'

const Ballast: React.FC = () => {
	return (
		<>
			<NextSeo title={'Ballast'} description={'Mint and redeem Bao synths for an equivalent asset.'} />
			<div className='space-y-4'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke text-center'>
						Ballast
					</Typography>
					<div className='flex gap-2 mx-auto'>
						<Icon icon='archived' className='m-0 h-8 w-8 flex-none' />
						<Typography className='m-0 text-base font-light tracking-tight lg:mb-4'>
							Mint and redeem Bao synths for an equivalent asset.
						</Typography>
					</div>
				</div>

				<div className='mt-10 lg:col-span-3 lg:mt-0'>
					<BallastCard />
				</div>
			</div>
		</>
	)
}

export default Ballast
