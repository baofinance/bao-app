import Typography from '@/components/Typography'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import Config from '@/bao/lib/config'
import AssetsCard from '@/pages/lend/components/AssetsCard'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import DebtCard from '@/pages/lend/components/DebtCard'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'
import { useTotalSupplies } from '@/hooks/lend/useTotalSupplies'
import { useOraclePrice } from '@/hooks/lend/useOraclePrice'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import Loader from '@/components/Loader'
import { useTotalCollateral } from '@/hooks/lend/useTotalCollateral'
import { BigNumber } from 'ethers'
import { useTotalDebt } from '@/hooks/lend/useTotalDebt'
import { useBorrowApy } from '@/hooks/lend/useBorrowApy'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'

export async function getStaticPaths() {
	const paths: { params: { market: string } }[] = []
	Object.keys(Config.lendMarkets).map(marketName => paths.push({ params: { market: marketName } }))

	return {
		paths: paths,
		fallback: false, // can also be true or 'blocking'
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
	const borrowBalances = useBorrowBalances(marketName)
	const supplyBalances = useSupplyBalances(marketName)
	const totalSupplies = useTotalSupplies(marketName)
	const oraclePrice = useOraclePrice(marketName)
	const totalCollateral = useTotalCollateral(marketName)
	const borrowApy = useBorrowApy(marketName)
	const totalDebt = useTotalDebt(marketName)
	const [supplyVal, setSupplyVal] = useState('0')
	const [borrowVal, setBorrowVal] = useState('0')
	const formattedOraclePrice = useMemo(() => oraclePrice && '$' + getDisplayBalance(oraclePrice, 18), [oraclePrice])
	const formattedTotalCollateral = useMemo(
		() => totalCollateral && oraclePrice && '$' + getDisplayBalance(totalCollateral),
		[totalCollateral, oraclePrice],
	)
	const utilization = useMemo(() => getDisplayBalance(getUtilization()) + '%', [totalDebt, totalCollateral])

	function getUtilization() {
		if (totalDebt && totalCollateral && decimate(totalCollateral) > BigNumber.from(0)) {
			return totalDebt.div(decimate(totalCollateral)).mul(100)
		}

		return BigNumber.from(0)
	}

	const formattedBorrowApy = useMemo(() => borrowApy && getDisplayBalance(borrowApy, 18, 2) + '%', [borrowApy])

	const handleSupplyVal = useCallback(
		(updatedState: any) => {
			// update the parent component's state with the new value
			setSupplyVal(updatedState)
		},
		[supplyVal],
	)

	const handleBorrowVal = useCallback(
		(updatedState: any) => {
			// update the parent component's state with the new value
			setBorrowVal(updatedState)
		},
		[borrowVal],
	)

	return (
		<>
			<NextSeo title={'Lend market'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				{
					<>
						<div className='mb-4 flex w-full flex-row items-center gap-4 rounded border-0 align-middle'>
							<Link href='/lend'>
								<div className='glassmorphic-card flex h-fit w-fit flex-row items-center p-4 align-middle duration-200 hover:bg-baoRed'>
									<FontAwesomeIcon icon={faArrowLeft} size='lg' />
								</div>
							</Link>
							{/*Desktop*/}
							<div className='hidden w-full !px-8 !py-4 lg:flex gap-12'>
								<div className='col-span-1 mx-0 my-0 flex flex-row items-center text-start align-left'>
									<Image
										src={`/images/tokens/${marketName}.png`}
										alt={marketName}
										className={`inline-block select-none`}
										height={42}
										width={42}
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-left font-bakbak leading-5'>
											{marketName}
										</Typography>
									</span>
								</div>

								<div className='h-10 w-[2px] ml-5 bg-baoWhite bg-opacity-40 my-auto' />

								<div className='mx-auto my-0 flex w-full items-center justify-between place-content-between'>
									<div className='flex gap-5 flex-wrap w-full justify-between place-content-between'>
										<div className='col-span-1 break-words text-left'>
											<Typography variant='sm' className='font-bakbak text-baoRed'>
												Oracle Price
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak text-left leading-5'>
												{formattedOraclePrice ? formattedOraclePrice : <Loader />}
											</Typography>
										</div>
										<div className='col-span-1 break-words'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Total Collateral
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												{formattedTotalCollateral ? formattedTotalCollateral : <Loader />}
											</Typography>
										</div>
										<div className='col-span-1 break-words text-left'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Utilization
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												{utilization ? utilization : <Loader />}
											</Typography>
										</div>
										<div className='col-span-1 break-words text-left'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Borrow Rate
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												{formattedBorrowApy ? formattedBorrowApy : <Loader />}
											</Typography>
											<Typography className='ml-1 inline-block font-bakbak leading-5 text-baoWhite'>vAPY</Typography>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div style={{ marginTop: '8px', marginBottom: '16px' }}></div>

						<div className='mt-6 grid gap-6 lg:grid-cols-1 lg:gap-16'>
							<div className='lg:col-span-1'>
								<AssetsCard borrowBalances={borrowBalances} totalSupplies={totalSupplies} marketName={marketName} />
							</div>
						</div>
					</>
				}
			</>
		</>
	)
}

export default Market
