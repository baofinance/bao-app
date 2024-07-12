import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import MarketList from '@/pages/lend/components/MarketList'

const Markets: React.FC = () => {
	return (
		<>
			<NextSeo title={'Lend'} description={'Markets to supply and borrow assets.'} />
			<div className=' space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap'>
					<Typography variant='hero' className='stroke'>
						Lend
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Supply and borrow assets in selected markets.
						</Typography>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<MarketList />
				</div>
			</div>
		</>
	)
}

export default Markets
