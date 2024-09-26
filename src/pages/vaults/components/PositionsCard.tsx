import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import Tooltipped from '@/components/Tooltipped'
import Typography from '@/components/Typography'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { Balance } from '@/hooks/vaults/useBalances'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'ethers'
import Image from 'next/future/image'
import React, { useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import WithdrawModal from './Modals/WithdrawModal'
import Card from '@/components/Card/Card'
import { faAngleUp, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import SupplyModal from './Modals/SupplyModal'
import { Transition } from '@headlessui/react'
import { StatBlock } from '@/components/Stats'

export const PositionList = ({
	vaultName,
	collateral,
	supplyBalances,
	exchangeRates,
	accountBalances,
	accountVaults,
	borrowBalances,
}: {
	vaultName: string
	supplyBalances: Balance[]
	collateral: ActiveSupportedVault[]
	exchangeRates: any
	accountBalances: Balance[]
	accountVaults: ActiveSupportedVault[]
	borrowBalances: Balance[]
}) => {
	const filteredCollateral = collateral.filter((vault: ActiveSupportedVault) => !(false !== vault.archived))
	return (
		<>
			<Typography variant='xl' className='p-2 text-left font-bakbak'>
				Supply
			</Typography>
			<Card className='!p-0 border-none shadow-none mt-2'>
				<Card.Body>
					<div className='flex flex-col gap-2'>
						{filteredCollateral
							.map((vault: ActiveSupportedVault) => (
								<PositionListItem
									vault={vault}
									vaultName={vaultName}
									accountBalances={accountBalances}
									accountVaults={accountVaults}
									supplyBalances={supplyBalances}
									borrowBalances={borrowBalances}
									exchangeRates={exchangeRates}
									key={vault.vaultAddress}
								/>
							))
							.sort((a, b) => (a.props.vault.isSynth === true ? -1 : b.props.vault.isSynth === false ? 1 : 0))}
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

const PositionListItem: React.FC<PositionListItemProps> = ({
	vault,
	vaultName,
	supplyBalances,
	borrowBalances,
	exchangeRates,
}: PositionListItemProps) => {
	const [showWithdrawModal, setShowWithdrawModal] = useState(false)
	const [showSupplyModal, setShowSupplyModal] = useState(false)
	//const [showRepayModal, setShowRepayModal] = useState(false)
	//const [selectedOption, setSelectedOption] = useState('ETH')
	const [showInfo, setShowInfo] = useState(false)
	const { account } = useWeb3React()

	const suppliedUnderlying = useMemo(() => {
		const supply = supplyBalances.find(balance => balance.address === vault.vaultAddress)
		if (supply === undefined) return BigNumber.from(0)
		if (exchangeRates[vault.vaultAddress] === undefined) return BigNumber.from(0)
		return decimate(supply.balance.mul(exchangeRates[vault.vaultAddress]))
	}, [supplyBalances, exchangeRates, vault.vaultAddress])

	const borrowed = useMemo(
		() => vault && borrowBalances?.find(balance => balance.address === vault.vaultAddress)?.balance,
		[borrowBalances, vault],
	)

	// FIXME: Causes crash
	// const isInVault = useMemo(() => {
	// 	return accountVaults && vault && accountVaults.find(_vault => _vault.vaultAddress === vault.vaultAddress)
	// }, [accountVaults, vault])

	// const [isChecked, setIsChecked] = useState(!!isInVault)

	// const baskets = useBaskets()
	// const basket =
	// 	vault.isBasket === true && baskets && baskets.find(basket => basket.address.toLowerCase() === vault.underlyingAddress.toLowerCase())

	// const composition = useComposition(vault.isBasket === true && basket && basket)
	// const avgBasketAPY =
	// 	vault.isBasket && composition
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

	return (
		<>
			<div className='flex w-full gap-2'>
				<div className='z-20 flex flex-col place-items-center gap-5 w-full'>
					<div className='flex w-full justify-between place-items-center gap-5 glassmorphic-card p-2'>
						<div className='text-baoWhite flex overflow-hidden rounded-2xl border border-baoWhite/20 bg-baoBlack shadow-lg shadow-baoBlack ring-1 ring-black ring-opacity-5 focus:outline-none select-none border-baoBlack px-2 py-3 text-sm'>
							<div className='mx-0 my-auto flex h-full justify-center items-center gap-4 w-[200px]'>
								<div className='col-span-3'>
									<Image
										src={`/images/tokens/${vault.icon}`}
										alt={`${vault.underlyingSymbol}`}
										width={isDesktop ? 24 : 32}
										height={isDesktop ? 24 : 32}
										className='inline-block select-none'
									/>
									<span className='hidden text-left align-middle lg:inline-block'>
										<Typography variant='lg' className='ml-2 font-bakbak leading-5'>
											{vault.underlyingSymbol}
										</Typography>
									</span>
								</div>
							</div>
						</div>
						<table className='table-fixed justify-between w-2/3 text-left md:table hidden'>
							<thead>
								<tr className='align-middle text-baoWhite/80'>
									<th>Total market supply</th>
									<th>Your Position</th>
								</tr>
							</thead>
							<div className='h-0 w-[200px] bg-red-400' />
							<tbody>
								<tr>
									<td>
										<Typography variant='xl' className='text-left font-bakbak leading-5'>
											<span className='align-middle'>{(Number(vault.supplied) / 1000000000000000000).toFixed(2)}</span>
										</Typography>
									</td>
									<td>
										<Typography variant='xl' className='text-left font-bakbak leading-5'>
											<span className='align-middle'>{`${getDisplayBalance(
												!vault.isSynth ? suppliedUnderlying : borrowed,
												vault.underlyingDecimals,
											)}`}</span>
										</Typography>
									</td>
								</tr>
							</tbody>
						</table>
						<div className='m-auto mr-2 flex space-x-2'>
							<Button
								className='!p-3'
								onClick={() => {
									// setSelectedOption(vault.underlyingSymbol)
									setShowInfo(prevState => !prevState) // Toggles the state
								}}
							>
								{showInfo ? (
									<FontAwesomeIcon icon={faAngleUp} width={72} height={24} />
								) : (
									<FontAwesomeIcon icon={faCircleInfo} width={72} height={24} />
								)}
							</Button>
							<Button fullWidth size='xs' onClick={() => setShowSupplyModal(true)} disabled={!account} className='!p-3 !h-12'>
								Supply
							</Button>
							<Button fullWidth size='xs' onClick={() => setShowWithdrawModal(true)} disabled={!account} className='!p-3 !h-12'>
								Withdraw
							</Button>
						</div>
					</div>
				</div>
			</div>
			<WithdrawModal asset={vault} vaultName={vaultName} show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} />
			<SupplyModal asset={vault} vaultName={vaultName} show={showSupplyModal} onHide={() => setShowSupplyModal(false)} />
			<Transition show={showInfo} leave='transition ease-in ease-out duration-300' leaveFrom='opacity-100' leaveTo='opacity-0'>
				<div className='flex p-2 space-x-1 items-center'>
					<div>
						<div className='col-span-3'>
							<Image
								src={`/images/tokens/${vault.icon}`}
								alt={`${vault.underlyingSymbol}`}
								width={isDesktop ? 24 : 32}
								height={isDesktop ? 24 : 32}
								className='inline-block select-none'
							/>
							<span className='hidden text-left align-middle lg:inline-block'>
								<Typography variant='xl' className='ml-2 text-left font-bakbak text-baoWhite/60'>
									{vault.underlyingSymbol}
								</Typography>
							</span>
						</div>
					</div>
					<Typography variant='xl' className='text-left font-bakbak text-baoWhite/60'>
						Collateral Info
					</Typography>
				</div>

				<StatBlock
					className='mb-3'
					label=''
					stats={[
						{
							label: 'Total Supplied',
							value: (
								<>
									<Tooltipped
										content={`$${getDisplayBalance(decimate(vault.supplied.mul(vault.price)))}`}
										key={vault.underlyingSymbol}
										placement='top'
										className='rounded-full bg-baoRed'
									>
										<Typography className='inline-block align-middle text-sm lg:text-base'>
											{getDisplayBalance(vault.supplied, vault.underlyingDecimals)}
										</Typography>
									</Tooltipped>
									<Image
										className='z-10 ml-1 inline-block select-none'
										src={vault && `/images/tokens/${vault.underlyingSymbol}.png`}
										alt={vault && vault.underlyingSymbol}
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
										{getDisplayBalance(vault.collateralFactor.mul(100), 18, 0)}%
									</Typography>
								</>
							),
						},
						{
							label: 'Initial Margin Factor',
							value: (
								<>
									<Typography className='inline-block align-middle text-sm lg:text-base'>
										{getDisplayBalance(vault.imfFactor.mul(100), 18, 0)}%
									</Typography>
								</>
							),
						},
						{
							label: 'Reserve Factor',
							value: (
								<>
									<Typography className='inline-block align-middle text-sm lg:text-base'>
										{getDisplayBalance(vault.reserveFactor.mul(100), 18, 0)}%
									</Typography>
								</>
							),
						},
						{
							label: 'Total Reserves',
							value: (
								<>
									<Typography className='inline-block align-middle text-sm lg:text-base'>
										${getDisplayBalance(vault.totalReserves.mul(vault.price), 18 + vault.underlyingDecimals)}
									</Typography>
								</>
							),
						},
					]}
				/>
			</Transition>
		</>
	)
}

export default PositionList

type PositionListItemProps = {
	vault: ActiveSupportedVault
	vaultName: string
	accountBalances?: Balance[]
	accountVaults?: ActiveSupportedVault[]
	accountLiquidity?: AccountLiquidity
	supplyBalances?: Balance[]
	borrowBalances?: Balance[]
	exchangeRates?: { [key: string]: BigNumber }
}
