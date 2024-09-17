import Typography from '@/components/Typography'
import React from 'react'
import { Icon } from '@/components/Icon'
import { Interface } from './components/Interface'
import { NextSeo } from 'next-seo'

const Stake: React.FC = () => {
	return (
		<div>
			<NextSeo title={'Stake'} description={'Stake bao synthetic tokens to earn yield.'} />
			<div className='lg:col-span-2 flex flex-wrap flex-col text-center'>
				<Typography variant='hero' className='stroke'>
					Stake
				</Typography>
				<div className='flex gap-2 mx-auto'>
					<Typography className='m-0 text-base font-light tracking-tight'>
						Stake bao synthetics and receive S-Tokens while earning yield.
					</Typography>
				</div>
				<Interface />
			</div>
		</div>
	)
}

export default Stake
