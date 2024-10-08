import Badge from '@/components/Badge'
import { PageLoader } from '@/components/Loader'
import Typography from '@/components/Typography'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useAccountBalances, useBorrowBalances, useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaultPrices } from '@/hooks/vaults/usePrices'
import { useAccountVaults, useVaults } from '@/hooks/vaults/useVaults'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber } from 'ethers'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import Image from 'next/future/image'
import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import DebtCard from './components/DashboardCard'
import MintCard from './components/MintCard'
import PositionList from './components/PositionsCard'

export async function getStaticPaths() {
	return {
		paths: [{ params: { vault: 'baoUSD' } }, { params: { vault: 'baoETH' } }],
		fallback: false, // can also be true or 'blocking'
	}
}

export async function getStaticProps({ params }: { params: any }) {
	const { vault } = params

	return {
		props: {
			vaultName: vault,
		},
	}
}

const Vault: NextPage<{
	vaultName: string
}> = ({ vaultName }) => {
	// const [depositVal, setDepositVal] = useState('0')
	const [mintVal, setMintVal] = useState('0')

	// const handleDepositVal = useCallback(
	// 	(updatedState: any) => {
	// 		// update the parent component's state with the new value
	// 		setDepositVal(updatedState)
	// 	},
	// 	[depositVal],
	// )

	const handleMintVal = useCallback(
		(updatedState: any) => {
			// update the parent component's state with the new value
			setMintVal(updatedState)
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[mintVal],
	)

	const _vaults = useVaults(vaultName)
	const accountBalances = useAccountBalances(vaultName)
	const accountVaults = useAccountVaults(vaultName)
	const accountLiquidity = useAccountLiquidity(vaultName)
	const supplyBalances = useSupplyBalances(vaultName)
	const borrowBalances = useBorrowBalances(vaultName)
	const { exchangeRates } = useExchangeRates(vaultName)
	// const balances = useAccountBalances(vaultName)
	const { prices } = useVaultPrices(vaultName)

	const collateral = useMemo(() => {
		if (!(_vaults && supplyBalances)) return
		return _vaults
			.filter(vault => !vault.isSynth)
			.sort((a, b) => {
				void a
				return supplyBalances.find(balance => balance.address.toLowerCase() === b.vaultAddress.toLowerCase()).balance.gt(0) ? 1 : 0
			})
	}, [_vaults, supplyBalances])

	const synth = useMemo(() => {
		if (!_vaults) return
		return _vaults.find(vault => vault.isSynth)
	}, [_vaults])

	const vaultTVLs = collateral && collateral.map(vault => ({ tvl: vault.liquidity.mul(vault.price) }))
	const totalCollateral = useMemo(() => vaultTVLs && vaultTVLs.reduce((acc, curr) => acc.add(curr.tvl), BigNumber.from(0)), [vaultTVLs])
	const totalDebt = synth && synth.totalBorrows.mul(synth.price)

	return (
		<>
			<NextSeo title={'Vaults'} description={'Provide different collateral types to mint synthetics.'} />
			<>
				{collateral && synth && accountBalances && accountLiquidity && accountVaults && supplyBalances && exchangeRates ? (
					<>
						<div className='mb-4 flex w-full flex-row items-center gap-4 rounded border-0 align-middle'>
							<Link href='/vaults'>
								<div className='glassmorphic-card flex h-fit w-fit flex-row items-center p-4 align-middle duration-200 hover:bg-baoRed'>
									<FontAwesomeIcon icon={faArrowLeft} size='lg' />
								</div>
							</Link>
							{/*Desktop*/}
							<div className='hidden w-full !px-8 !py-4 lg:flex gap-12'>
								<div className='col-span-1 mx-auto my-0 flex flex-row items-center text-start align-middle'>
									<Image
										src={`/images/tokens/${synth.icon}`}
										alt={`${synth.underlyingSymbol}`}
										width={40}
										height={40}
										className='inline-block select-none'
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
											{synth.underlyingSymbol}
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
												${getDisplayBalance(synth.price)}
											</Typography>
										</div>
										<div className='col-span-1 break-words'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Total Collateral
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												${getDisplayBalance(decimate(totalCollateral), synth.underlyingDecimals)}
											</Typography>
										</div>
										<div className='col-span-1 break-words text-left'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Utilization
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												{getDisplayBalance(totalDebt.div(decimate(totalCollateral)).mul(100))}%
											</Typography>
										</div>
										<div className='col-span-1 break-words text-left'>
											<Typography variant='sm' className='font-bakbak text-baoRed text-left'>
												Borrow Rate
											</Typography>
											<Typography variant='h3' className='inline-block font-bakbak leading-5'>
												{getDisplayBalance(synth.borrowApy, 18, 2)}%
											</Typography>
											<Typography className='ml-1 inline-block font-bakbak leading-5 text-baoWhite'>vAPY</Typography>
										</div>
									</div>
								</div>
							</div>
							{/*Mobile*/}
							<div className='w-full lg:hidden'>
								<div className='my-0 flex w-full flex-row items-center justify-end align-middle'>
									<Image
										src={`/images/tokens/${synth.icon}`}
										alt={`${synth.underlyingSymbol}`}
										width={40}
										height={40}
										className='inline-block select-none'
									/>
									<span className='inline-block text-left align-middle'>
										<Typography variant='h3' className='ml-2 inline-block items-center align-middle font-bakbak leading-5'>
											{synth.underlyingSymbol}
										</Typography>
										<Badge className='ml-2 inline-block font-bakbak text-base'>${getDisplayBalance(synth.price)}</Badge>
									</span>
								</div>
							</div>
						</div>
						<div className='glassmorphic-card grid grid-cols-3 !rounded-3xl lg:hidden'>
							<div className='col-span-1 break-words px-2 py-2 text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Total Debt
								</Typography>
								<Typography variant='base' className='inline-block font-bakbak leading-5'>
									${getDisplayBalance(decimate(totalDebt), synth.underlyingDecimals)}
								</Typography>
							</div>
							<div className='col-span-1 break-words px-2 py-2 text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Total Collateral
								</Typography>
								<Typography variant='base' className='inline-block font-bakbak leading-5'>
									${getDisplayBalance(decimate(totalCollateral), synth.underlyingDecimals)}
								</Typography>
							</div>
							<div className='col-span-1 break-words px-2 py-2 text-center'>
								<Typography variant='sm' className='font-bakbak text-baoRed'>
									Borrow Rate
								</Typography>
								<Typography variant='base' className='inline-block font-bakbak leading-5'>
									{getDisplayBalance(synth.borrowApy, 18, 2)}%
								</Typography>
							</div>
						</div>

						<div style={{ marginTop: '8px', marginBottom: '16px' }}>
							<DebtCard vaultName={vaultName} asset={synth} depositVal={'0'} mintVal={mintVal} />
						</div>

						<div style={{ marginTop: '8px', marginBottom: '0' }}>
							<PositionList
								vaultName={vaultName}
								supplyBalances={supplyBalances}
								collateral={collateral}
								exchangeRates={exchangeRates}
								accountBalances={accountBalances}
								accountVaults={accountVaults}
								borrowBalances={borrowBalances}
							/>
							<MintCard vaultName={vaultName} prices={prices} accountLiquidity={accountLiquidity} synth={synth} onUpdate={handleMintVal} />
						</div>
					</>
				) : (
					<PageLoader block />
				)}
			</>
		</>
	)
}

export default Vault
