import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import VaultList from '@/pages/vaults/components/VaultList'
import { NextSeo } from 'next-seo'
import React from 'react'

const Vaults: React.FC = () => {
	return (
		<div className='max-w-3xl mx-auto'>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2'>
					<Typography variant='hero' className='stroke'>
						Borrow
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Access price-stable synthetic assets instantly, leveraging yield-bearing ETH-based collaterals on your own terms.
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

export default Vaults
