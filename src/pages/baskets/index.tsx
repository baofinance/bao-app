import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import { NextSeo } from 'next-seo'
import React from 'react'
import BasketList from './components/BasketList'
import { Icon } from '@/components/Icon'

const Baskets: React.FC = () => {
	const baskets = useBaskets()

	return (
		<>
			<NextSeo title={`Baskets`} description={`Get diversified exposure to crypto assets with Bao Baskets!`} />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap'>
					<Typography variant='hero' className='stroke'>
						Baskets
					</Typography>
				</div>
				<div className='lg:col-span-3'>
					<div className='mb-6 rounded-3xl bg-baoWhite/5 p-8 border border-baoRed/30'>
						<div className='flex gap-4'>
							<Icon icon='warning' className='m-0 h-12 w-12 flex-none text-baoRed' />
							<div className='flex flex-col gap-3'>
								<Typography className='m-0 text-xl font-light tracking-tight'>
									As the baskets and nests are being sunsetted we will be disabling them by end of year 2025.
								</Typography>
								<Typography className='m-0 text-xl font-light tracking-tight'>
									After that the basket and nest token price will be snapshotted and you will be able to burn and claim TIDE tokens at
									community sale price.
								</Typography>
							</div>
						</div>
					</div>
					<BasketList baskets={baskets} />
				</div>
			</div>
		</>
	)
}

export default Baskets
