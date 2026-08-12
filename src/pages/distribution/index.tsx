import { NavButtons } from '@/components/Button'
import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React, { useState } from 'react'
import LiquidSwap from './components/LiquidSwap'
import Locked from './components/Locked'

const tabs = ['Liquid BAO', 'Locked BAO']

const Distribution: React.FC = () => {
	const [tab, setTab] = useState(tabs[0])

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
						Swap liquid BAOv1 for BAOv2, or lock and migrate your BAOv1 holdings
					</Typography>
					<div className='mx-auto mb-8 max-w-md'>
						<NavButtons options={tabs} active={tab} onClick={setTab} />
					</div>

					{tab === 'Liquid BAO' ? <LiquidSwap /> : <Locked />}
				</div>
			</div>
		</>
	)
}

export default Distribution
