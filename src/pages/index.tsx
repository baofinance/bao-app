import Button from '@/components/Button'
import Typography from '@/components/Typography'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import React from 'react'

const Home: React.FC = () => {
	return (
		<>
			<NextSeo title={`Home`} description={`Get started with BAO Finance!`} />
			<div className='grid gap-10 lg:grid-cols-5 lg:gap-24 '>
				<div className='w-full lg:col-span-2 my-auto'>
					<Typography variant='splash' className='stroke'>
						BAO
						<br /> Finance
					</Typography>
					<div className='my-4 flex gap-2'>
						{/* <Icon icon='lightbulb' className='m-0 h-6 w-6 flex-none' /> */}
						<Typography className='m-0 pr-1 font-light text-base lg:mb-4'>
							Gain exposure to an ever-increasing number of tokens and diversify your portfolio on one of Ethereum&apos;s most decentralized
							synthetic markets.
						</Typography>
					</div>
					<div>
						<Link href='/baskets'>
							<Button className='!rounded-full border border-baoRed hover:bg-baoRed'>Get Started</Button>
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}

export default Home
