import Typography from '@/components/Typography'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Link from 'next/link'
import React from 'react'
import Config from '@/bao/lib/config'
import AssetsCard from '@/pages/lend/components/AssetsCard'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import DebtCard from '@/pages/lend/components/DebtCard'
import { useWeb3React } from '@web3-react/core'

export async function getStaticPaths() {
	const paths: { params: { market: string } }[] = []
	Object.keys(Config.lendMarkets).map(marketName => paths.push({ params: { market: marketName } }))

	return {
		paths: paths,
		fallback: false,
	}
}

export async function getStaticProps({ params }: { params: any }) {
	const { market } = params

	return {
		props: {
			marketName: market,
		},
	}
}

const Market: NextPage<{
	marketName: string
}> = ({ marketName }) => {
	const { chainId } = useWeb3React()
	const market = Config.lendMarkets[marketName]
	const supplyBalances = useSupplyBalances(marketName)
	const totalSupplies = useTotalSupplies(marketName)

	return (
		<>
			<NextSeo title={'Lend market'} description={'Provide different collateral types to mint synthetics.'} />
			<div className='flex flex-col gap-4'>
				{/* Back Button and Title Section - Now in a row */}
				<div className='flex items-center justify-between'>
					<Link href='/lend'>
						<div className='glassmorphic-card flex h-fit w-fit flex-row items-center p-4 align-middle duration-200 hover:bg-baoRed'>
							<FontAwesomeIcon icon={faArrowLeft as unknown as IconProp} size='lg' />
						</div>
					</Link>
					<Typography variant='h1' className='font-bakbak flex-grow text-center'>
						<span className='relative inline-block'>
							<span className='relative z-10'>{market.name} Market</span>
							<span className='absolute inset-0 bg-baoRed translate-y-0 px-4 -mx-4 py-1 -my-1'></span>
						</span>
					</Typography>
					<div className='w-[40px]'></div> {/* Spacer to balance the back button */}
				</div>

				{/* Debt Card */}
				<DebtCard marketName={marketName} />

				{/* Assets Card */}
				<AssetsCard marketName={marketName} supplyBalances={supplyBalances} totalSupplies={totalSupplies} />
			</div>
		</>
	)
}

export default Market
