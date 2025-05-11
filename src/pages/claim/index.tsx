import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import Claim from './components/Claim'

const ClaimPage: React.FC = () => {
	return (
		<>
			<NextSeo title='Claim' description='Claim your BaoV2 tokens' />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Claim
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Claim your BAOv2 tokens for participation in our franchise protocols Panda and Polly
						</Typography>
					</div>
				</div>

				{/* Claim Section */}
				<div className='lg:col-span-3'>
					<Typography variant='h3' className='pt-12 pb-2 text-center font-bakbak'>
						Claim
					</Typography>
					<Typography variant='base' className='pb-2 text-center leading-5 m-0 pr-1 font-light tracking-tight lg:mb-4'>
						If you are eligible, you can claim your BAOv2 tokens here.
					</Typography>

					<Claim />
				</div>
			</div>
		</>
	)
}

export default ClaimPage
