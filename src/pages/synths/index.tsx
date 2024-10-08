import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import VaultList from '@/pages/synths/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'

const Synths: React.FC = () => {
	return (
		<div className='max-w-3xl mx-auto'>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Synths
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Create synthetic assets pegged to real-world or crypto asset prices, backed by a variety of supported collateral types. Prices
							are maintained through accurate, decentralized oracle networks.
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
					<VaultList />
				</div>
			</div>
		</div>
	)
}

export default Synths
