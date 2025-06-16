import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import IDO from './components/IDO'

const IDOPage: React.FC = () => {
	return (
		<>
			<NextSeo title='IDO' description='Zhenglong IDO deposit' />
			<div className='space-y-4'>
				<div className='max-w-6xl mx-auto space-y-2 px-4'>
					{/* Hero */}
					<Typography variant='hero' className='stroke'>
						IDO
					</Typography>

					{/* Icon Pair */}
					<div className='my-10 flex items-center justify-center gap-6'>
						<img src='/images/icons/icon-w-background.png' alt='Icon Left' className='h-32 w-32 object-contain' />
						<img src='/images/white_X_transparent.png' alt='collab' className='h-8 w-8 object-contain' />
						<img src='/images/platforms/ZhengLong.png' alt='Icon Right' className='h-48 w-48 object-contain' />
						<img src='/images/white_X_transparent.png' alt='collab' className='h-8 w-8 object-contain' />
						<img src='/images/platforms/fx.png' alt='Icon Left' className='h-32 w-32 object-contain' />
					</div>

					{/* Eligibility */}
					<div className='flex items-start gap-3'>
						<div className='flex-none pt-1'>
							<Icon icon='lightbulb' className='h-6 w-6 text-pink' />
						</div>
						<Typography variant='xl' className='text-white text-left font-bakbak w-full'>
							<span className='block'>
								If you hold veBao, veFXN, or a liquid locker version of veFXN, you are eligible for the token-gated IDO of Zhenglong and the
								STEAM token.
							</span>
							<span className='block'>Discounted allocation is based on your veToken balance:</span>
							<span className='block'>
								– 1 veBao = 0.25 STEAM at a discount
								<br />– 1 veFXN = 150 STEAM at a discount
							</span>
						</Typography>
					</div>
				</div>

				{/* Main IDO Component */}
				<IDO />

				{/* Warning */}
				<div className='flex items-start gap-3'>
					<div className='flex-none pt-1'>
						<Icon icon='warning' className='h-6 w-6 text-yellow-400' />
					</div>
					<Typography variant='xl' className='text-yellow-400 text-left font-bakbak w-full'>
						<span className='block'>Tokens are not issued upon deposit. They will be available at TGE in the next few months.</span>
						<span className='block'>
							Token distribution will follow a fair process: discounted allocations are filled first, followed by full-priced ones.
						</span>
						<span className='block'>Smaller and larger allocations are filled equally.</span>
						<span className='block'>Your discounted allocation is determined by the amount of veTokens you have locked.</span>
					</Typography>
				</div>
			</div>
		</>
	)
}

export default IDOPage
