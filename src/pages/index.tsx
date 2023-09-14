import Button from '@/components/Button'
import Typography from '@/components/Typography'
import useBaskets from '@/hooks/baskets/useBaskets'
import { NextSeo } from 'next-seo'
import React from 'react'
import BasketList from './baskets/components/BasketList'
import { Icon } from '@/components/Icon'
import Image from 'next/image'

const Home: React.FC = () => {
	return (
		<>
			<NextSeo title={`Home`} description={`Get started with BAO Finance!`} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24 '>
				<div className='w-full lg:col-span-2 my-auto'>
					<Typography variant='splash' className='stroke'>
						BAO<br /> Finance
					</Typography>
					<div className='mt-4 flex gap-2'>
						{/* <Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' /> */}
						<Typography className='m-0 pr-1 font-light text-base lg:mb-4'>
							Gain exposure to an ever-increasing number of tokens and diversify your portfolio on one of
							Ethereum's most decentralized synthetic markets.
						</Typography>
					</div>
					 <div>
						<a href='/baskets'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Get Started</Button>
						</a>
					</div>
				</div>
				{/* <div className='relative'>
					<Image src='/images/icons/icon-512.png' alt='bao-icon' width={500} height={500} />
				</div> */}
			</div>
		</>
	)
}

export default Home
