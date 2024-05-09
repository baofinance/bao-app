import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import React, { useState } from 'react'
import BallastCard from './components/Ballast'
import { Icon } from '@/components/Icon'
import VaultList from '@/pages/vaults/components/VaultList'
import SwapList from '@/pages/ballast/components/SwapList'
import ReactSwitch from 'react-switch'

const Ballast: React.FC = () => {
	const [showBallast, setShowBallast] = useState(false)

	const handleShowBallastToggle = () => {
		setShowBallast(!showBallast)
	}

	return (
		<>
			<NextSeo title={'Ballast'} description={'Mint and redeem Bao synths for an equivalent asset.'} />
			<div className='space-y-12'>
				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Swap
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' />
						<Typography className='m-0 pr-1 text-base font-light tracking-tight lg:mb-4'>
							Swap BaoETH, BaoUSD and Bao right here using the LlamaSwap aggregator by DefiLlama.
						</Typography>
					</div>
					<div className='flex lg:block mr-auto'>
						<a
							className='mr-auto'
							href='https://info.bao.finance/docs/guides/bao-markets/ballast'
							target='_blank'
							rel='noopener noreferrer'
						>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Learn More</Button>
						</a>
					</div>
				</div>
				<div className='lg:col-span-3'>
					<SwapList />
				</div>

				<div className='lg:col-span-2 flex flex-wrap flex-col'>
					<Typography variant='hero' className='stroke'>
						Ballast - Archived
					</Typography>
					<div className='mt-4 flex gap-2'>
						<Icon icon='archived' className='m-0 h-8 w-8 flex-none' />
						<Typography className='m-0 text-base font-light tracking-tight lg:mb-4'>Ballast has been archived toggle to enable.</Typography>
					</div>
				</div>

				<div className={`flex w-full flex-row gap-2 px-2 py-3`}>
					<ReactSwitch
						checked={showBallast}
						onChange={handleShowBallastToggle}
						offColor={`#1e2022`}
						onColor={`#e21a31`}
						className={`border border-baoWhite border-opacity-20`}
					/>
					<Typography className='text-center font-bakbak text-base lg:text-lg'>Show Ballast</Typography>
				</div>
				{showBallast && (
					<div className='mt-10 lg:col-span-3 lg:mt-0'>
						<BallastCard />
					</div>
				)}
			</div>
		</>
	)
}

export default Ballast
