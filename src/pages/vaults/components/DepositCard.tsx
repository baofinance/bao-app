import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import Card from '@/components/Card/Card'
import { StatBlock } from '@/components/Stats'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { Balance } from '@/hooks/vaults/useBalances'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { faAngleUp, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Transition } from '@headlessui/react'
import { parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useEffect, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import SupplyModal from './Modals/SupplyModal'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'
import { Icon } from '@/components/Icon'

export const DepositCard = ({
	vaultName,
	collateral,
	onUpdate,
}: {
	vaultName: string
	balances: Balance[]
	collateral: ActiveSupportedVault[]
	accountBalances: Balance[]
	onUpdate: (updatedState: any) => void
}) => {
	const [val, setVal] = useState<string>('')
	const [selectedOption, setSelectedOption] = useState('ETH')
	const [showSupplyModal, setShowSupplyModal] = useState(0)
	const [showInfo, setShowInfo] = useState(false)

	const asset =
		collateral &&
		(collateral.length
			? collateral.find(asset => asset.underlyingSymbol === selectedOption)
			: collateral.find(asset => asset.underlyingSymbol === 'wstETH'))

	// const baskets = useBaskets()
	// const basket =
	// 	asset &&
	// 	asset.isBasket === true &&
	// 	baskets &&
	// 	baskets.find(basket => basket.address.toLowerCase() === asset.underlyingAddress.toLowerCase())

	// const composition = useComposition(asset && basket && asset.isBasket === true && basket)
	// const avgBasketAPY =
	// 	asset && asset.isBasket && composition
	// 		? (composition
	// 				.sort((a, b) => (a.percentage.lt(b.percentage) ? 1 : -1))
	// 				.map(component => {
	// 					return component.apy
	// 				})
	// 				.reduce(function (a, b) {
	// 					return a + parseFloat(formatUnits(b))
	// 				}, 0) /
	// 				composition.length) *
	// 			100
	// 		: 0

	useEffect(() => {
		if (val != '') {
			onUpdate(decimate(parseUnits(val).mul(asset.price)).toString())
		}
	}, [asset, onUpdate, val])

	const hide = () => {
		setVal('')
		setShowSupplyModal(0)
	}

	return (
		<>
			<Typography variant='xl' className='p-4 text-left font-bakbak'>
				Supply
			</Typography>
			<Card className='glassmorphic-card p-6'>
				<Card.Body>
					<div className='flex w-full gap-2'>
						<div className='z-20 flex flex-col place-items-center gap-5 w-full'>
							{collateral
								.filter((asset: ActiveSupportedVault) => !(false !== asset.archived))
								.map((currentAsset: ActiveSupportedVault, index) => (
									<div
										className={
											'flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2' +
											(selectedOption == currentAsset.underlyingSymbol ? ' !border-baoRed !bg-transparent-300' : '')
										}
										key={index}
									>
										<Tooltipped
											content={false !== asset.archived ? 'Deprecated' : 'Active'}
											key={currentAsset.toString()}
											placement='top'
											className='rounded-full bg-baoRed '
										>
											<div
												key={currentAsset.underlyingSymbol}
												className={
													'text-baoWhite flex overflow-hidden rounded-2xl border border-baoWhite/20 bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'
												}
											>
												<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[200px]'>
													<div className='col-span-3'>
														<Image
															className='z-10 inline-block select-none'
															src={`/images/tokens/${currentAsset.underlyingSymbol}.png`}
															alt={currentAsset.underlyingSymbol}
															width={24}
															height={24}
														/>
														<span className='ml-2 inline-block text-left align-middle'>
															<Typography variant='lg' className='font-bakbak'>
																{currentAsset.underlyingSymbol}
															</Typography>
														</span>
													</div>
												</div>
											</div>
										</Tooltipped>
										<table className='table-fixed justify-between w-2/3 text-left md:table hidden'>
											<thead>
												<tr className=''>
													<th>Total market supply</th>
													<th>Your Position</th>
												</tr>
											</thead>
											<div className='h-1 w-[200px] bg-red-400' />
											<tbody>
												<tr>
													<td>
														{(
															Number(
																collateral.find(assetToFind => assetToFind.underlyingAddress === currentAsset.underlyingAddress)?.supplied,
															) / 1000000000000000000
														).toFixed(2)}
													</td>
													<td>
														{(
															Number(
																collateral.find(assetToFind => assetToFind.underlyingAddress === currentAsset.underlyingAddress)?.supplied,
															) / 1000000000000000000
														).toFixed(2)}
													</td>
												</tr>
											</tbody>
										</table>
										<div className='m-auto mr-2 flex space-x-2'>
											<Button
												className='!p-3'
												onClick={() => {
													setSelectedOption(currentAsset.underlyingSymbol)
													setShowInfo(true)
												}}
											>
												<Icon icon={faCircleInfo} className='w-6 h-6' />
											</Button>
											<Button onClick={() => setShowSupplyModal(index + 1)} className={!isDesktop ? '!h-10 !px-2 !text-sm' : ''}>
												Supply
											</Button>
											<SupplyModal asset={currentAsset} vaultName={vaultName} show={showSupplyModal == index + 1} onHide={hide} />
											<Button onClick={() => setShowSupplyModal(index + 1)} className={!isDesktop ? '!h-10 !px-2 !text-sm' : ''}>
												Withdraw
											</Button>
											<SupplyModal asset={currentAsset} vaultName={vaultName} show={showSupplyModal == index + 1} onHide={hide} />
										</div>
									</div>
								))}
						</div>
					</div>
					<Transition show={showInfo} leave='transition ease-in duration-100' leaveFrom='opacity-100' leaveTo='opacity-0'>
						<div className='flex p-2 mt-5 space-x-3'>
							<button onClick={() => setShowInfo(false)} className=''>
								<Icon icon={faAngleUp} className='w-8 h-8' />
							</button>
							<Typography variant='xl' className=' text-left font-bakbak text-baoWhite/60'>
								Collateral Info
							</Typography>
						</div>

						<StatBlock
							label=''
							stats={[
								{
									label: 'Total Supplied',
									value: (
										<>
											<Tooltipped
												content={`$${getDisplayBalance(decimate(asset.supplied.mul(asset.price)))}`}
												key={asset.underlyingSymbol}
												placement='top'
												className='rounded-full bg-baoRed'
											>
												<Typography className='inline-block align-middle text-sm lg:text-base'>
													{getDisplayBalance(asset.supplied, asset.underlyingDecimals)}
												</Typography>
											</Tooltipped>
											<Image
												className='z-10 ml-1 inline-block select-none'
												src={asset && `/images/tokens/${asset.underlyingSymbol}.png`}
												alt={asset && asset.underlyingSymbol}
												width={16}
												height={16}
											/>
										</>
									),
								},
								{
									label: 'Collateral Factor',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{getDisplayBalance(asset.collateralFactor.mul(100), 18, 0)}%
											</Typography>
										</>
									),
								},
								{
									label: 'Initial Margin Factor',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{getDisplayBalance(asset.imfFactor.mul(100), 18, 0)}%
											</Typography>
										</>
									),
								},
								{
									label: 'Reserve Factor',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{getDisplayBalance(asset.reserveFactor.mul(100), 18, 0)}%
											</Typography>
										</>
									),
								},
								{
									label: 'Total Reserves',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												${getDisplayBalance(asset.totalReserves.mul(asset.price), 18 + asset.underlyingDecimals)}
											</Typography>
										</>
									),
								},
							]}
						/>
					</Transition>
				</Card.Body>
			</Card>
		</>
	)
}

export default DepositCard
