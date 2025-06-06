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
					<div className='flex flex-col gap-2 lg:mb-4'>
						{/* Alert Message */}
						<div className='flex items-start gap-2'>
							<Icon icon='warning' className='h-6 w-6 flex-none text-red' />
							<Typography variant='xl' className='text-red text-center font-bakbak'>
								Panda / Polly claim has ended!
							</Typography>
						</div>

						{/* Info Message */}
						<div className='flex items-start gap-2'>
							<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
							<Typography variant='xl' className='text-white text-center font-bakbak'>
								Claim your BAOv2 tokens for locking veBao. If you are eligible, you can claim your BAOv2 tokens here.
							</Typography>
						</div>
					</div>
				</div>

				<Claim />
			</div>
		</>
	)
}

export default ClaimPage
