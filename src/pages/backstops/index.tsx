import Button from '@/components/Button'
import { Icon } from '@/components/Icon'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React from 'react'
import BackstopList from './components/BackstopList'

const Backstops: React.FC = () => {
	return (
		<>
			<NextSeo title={'Backstops'} description={`Ensure Bao Vaults' stability.`} />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap'>
					<Typography variant='hero' className='stroke'>
						BACKSTOPS
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Ensure Bao Vaults&apos; stability and access genuine &apos;real yield&apos;. Redirect MEV and bot profits directly to our
							community via democratized liquidations. Repay at-risk positions with your deposits, while liquidation penalties from seized
							collateral are swiftly converted to the deposited asset.
						</Typography>
					</div>
					<div className='flex lg:block mr-auto'>
						<a
							className='mr-auto'
							href='https://info.bao.finance/docs/guides/gauges/depositing-lps-for-rewards'
							target='_blank'
							rel='noopener noreferrer'
						>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<BackstopList />
				</div>
			</div>
		</>
	)
}

export default Backstops
