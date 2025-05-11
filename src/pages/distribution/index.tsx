import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import Locked from './components/Locked'

const Distribution: React.FC = () => {
	return (
		<>
			<NextSeo title='Distribution' description='Migrate your BAOv1 to BAOv2!' />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Distribution
					</Typography>
					<div className='flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Migrate your BAOv1 tokens to BAOv2 and participate in the updated protocol
						</Typography>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<Typography variant='h3' className='pt-8 pb-2 text-center font-bakbak'>
						Migration Portal
					</Typography>
					<Typography variant='base' className='pb-2 text-center leading-5 m-0 pr-1 font-light tracking-tight lg:mb-4'>
						Use this tool to lock and migrate your BAOv1 holdings to the new version
					</Typography>

					<Locked />
				</div>
			</div>
		</>
	)
}

export default Distribution
