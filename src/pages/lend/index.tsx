import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import VaultList from '@/pages/vaults/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'
import MarketList from './components/MarketList'

const Markets: React.FC = () => {
	return (
		<div className='max-w-3xl mx-auto'>
			<NextSeo title={'Lend'} description={'Markets to supply and borrow assets.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Lend
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Supply and borrow assets in selected markets. Engage in a decentralized finance ecosystem that empowers you to manage your
							assets flexibly and efficiently.
						</Typography>
					</div>

					<div className='flex lg:block mr-auto'>
						<a
							className='mr-auto'
							href='https://info.bao.finance/docs/franchises/bao-markets-hard-synths'
							target='_blank'
							rel='noopener noreferrer'
						>
							<button className='glassmorphic-card px-4 py-2 font-bakbak border-baoRed hover:bg-baoRed'>Learn More</button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<MarketList />
				</div>
			</div>
		</div>
	)
}

export default Markets
