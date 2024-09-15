import { ActiveSupportedVault } from '@/bao/lib/types'
import Button from '@/components/Button'
import Card from '@/components/Card/Card'
import Input from '@/components/Input'
import { StatBlock } from '@/components/Stats'
import Typography from '@/components/Typography'
import { AccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useBorrowBalances } from '@/hooks/vaults/useBalances'
import { providerKey } from '@/utils/index'
import { decimate, getDisplayBalance } from '@/utils/numberFormat'
import { useQuery } from '@tanstack/react-query'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, FixedNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { isDesktop } from 'react-device-detect'
import RepayModal from './Modals/RepayModal'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'

export const MintCard = ({
	vaultName,
	synth,
	prices,
	accountLiquidity,
	onUpdate,
}: {
	vaultName: string
	prices: any
	accountLiquidity: AccountLiquidity
	synth: ActiveSupportedVault
	onUpdate: (updatedState: any) => void
}) => {
	const { account, library, chainId } = useWeb3React()
	const [val, setVal] = useState<string>('')
	const [showRepayModal, setShowRepayModal] = useState(false)
	const borrowBalances = useBorrowBalances(vaultName)
	const { pendingTx, txHash, handleTx } = useTransactionHandler()

	const { data: maxMintable } = useQuery(
		['@/hooks/base/useTokenBalance', providerKey(library, account, chainId)],
		async () => {
			const _maxMintable = await synth.underlyingContract.balanceOf(synth.vaultAddress)
			return _maxMintable
		},
		{
			placeholderData: BigNumber.from(0),
		},
	)

	const borrowed = useMemo(
		() => synth && borrowBalances && borrowBalances.find(balance => balance.address === synth.vaultAddress).balance,
		[borrowBalances, synth],
	)

	const max = () => {
		return prices && accountLiquidity && synth.price.gt(0)
			? BigNumber.from(
					FixedNumber.from(formatUnits(accountLiquidity && accountLiquidity.usdBorrowable)).divUnsafe(
						FixedNumber.from(formatUnits(synth.price)),
					),
				)
			: BigNumber.from(0)
	}

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			if (e.currentTarget.value.length < 20) setVal(e.currentTarget.value)
		},
		[setVal],
	)

	useEffect(() => {
		if (val != '') {
			onUpdate(decimate(parseUnits(val).mul(synth.price)).toString())
		}
	}, [onUpdate, synth, val])

	const hide = () => {
		setVal('')
	}

	return (
		<>
			<Typography variant='xl' className='p-2 text-left font-bakbak'>
				Borrow
			</Typography>
			<Card className='glassmorphic-card p-2'>
				<Card.Body>
					<div className='flex w-full gap-2'>
						<div className='flex items-center gap-3 w-full py-2'>
							<div>
								<div className='m-2 mr-0 flex w-10 rounded-full border-none duration-300 lg:!m-2 lg:w-32 lg:bg-baoWhite/5 lg:hover:bg-transparent-300'>
									<div className='m-auto text-baoWhite lg:py-3'>
										<div className='items-start'>
											<div className='inline-block lg:mr-2'>
												<Image
													className='z-10 inline-block select-none'
													src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
													alt={synth && synth.underlyingSymbol}
													width={isDesktop ? 24 : 32}
													height={isDesktop ? 24 : 32}
												/>
											</div>
											<span className='hidden text-left align-middle lg:inline-block'>
												<Typography variant='lg' className='font-bakbak'>
													{synth && synth.underlyingSymbol}
												</Typography>
											</span>
										</div>
									</div>
								</div>
							</div>
							<Input
								value={val}
								onChange={handleChange}
								onSelectMax={() => setVal(formatUnits(max(), synth.underlyingDecimals))}
								placeholder={`${formatUnits(max(), synth.underlyingDecimals)}`}
								className='h-12 min-w-[150px] w-full bg-baoBlack lg:h-auto'
							/>
							<div className='m-auto mr-2'>
								<Button
									onClick={async () => {
										try {
											// Check if a value is entered and initiate the mint/borrow process
											const vaultContract = synth.vaultContract
											const borrowAmount = parseUnits(val, synth.underlyingDecimals)

											// Call the borrow function from the contract, do NOT await it here
											const txPromise = vaultContract.borrow(borrowAmount) // This returns a Promise<ContractTransaction>

											// Pass the Promise (txPromise) to handleTx, not the resolved transaction
											handleTx(
												txPromise, // Pass the promise here
												`${vaultName} Vault: Mint ${getDisplayBalance(val, synth.underlyingDecimals)} ${synth.underlyingSymbol}`,
												() => {
													// Callback after the transaction completes, if necessary
													hide() // Reset or clear form values after successful transaction
												},
											)
										} catch (err) {
											console.error('Mint/Borrow transaction failed', err)
										}
									}}
									disabled={
										!val || // Disable if no value is entered
										parseFloat(val) <= 0 || // Disable if the entered value is <= 0
										parseUnits(val, synth.underlyingDecimals).gt(max()) || // Disable if the entered value exceeds the max borrowable amount
										// Temporary minting/borrowing limits
										(borrowed.lt(parseUnits(vaultName === 'baoUSD' ? '100' : '2')) &&
											parseUnits(val, synth.underlyingDecimals).lt(parseUnits(vaultName === 'baoUSD' ? '100' : '2')))
									}
									className={!isDesktop ? '!h-10 !px-2 !text-sm' : ''}
								>
									Borrow
								</Button>
							</div>
							<div className='m-auto mr-2'>
								<Button onClick={() => setShowRepayModal(true)} className={!isDesktop ? '!h-10 !px-2 !text-sm' : ''}>
									Repay
								</Button>
								<RepayModal asset={synth} vaultName={vaultName} show={showRepayModal} onHide={() => setShowRepayModal(false)} />
							</div>
						</div>
					</div>
					<Typography variant='xl' className='p-4 text-center font-bakbak text-baoWhite/60'>
						Borrow Info
					</Typography>
					<div className='flex flex-col gap-4 rounded'>
						<StatBlock
							className='flex basis-1/2 flex-col'
							stats={[
								{
									label: 'Minimum Mint',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{synth.minimumBorrow ? synth.minimumBorrow.toLocaleString() : '-'}{' '}
											</Typography>
											<Image
												className={(synth.minimumBorrow && 'hidden', 'z-10 ml-1 inline-block select-none')}
												src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
												alt={synth && synth.underlyingSymbol}
												width={16}
												height={16}
											/>
										</>
									),
								},
								{
									label: 'Max Mintable',
									value: (
										<>
											<Typography className='inline-block align-middle text-sm lg:text-base'>
												{getDisplayBalance(maxMintable ? maxMintable : 0)}
											</Typography>
											<Image
												className='z-10 ml-1 inline-block select-none'
												src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
												alt={synth && synth.underlyingSymbol}
												width={16}
												height={16}
											/>
										</>
									),
								},
								{
									label: 'Borrowed',
									value: (
										<>
											<Typography className='m-auto inline-block align-middle font-bakbak text-baoRed'>
												{borrowed ? getDisplayBalance(borrowed) : 0}
											</Typography>
											<Image
												className='z-10 m-auto ml-1 inline-block select-none align-middle'
												src={synth && `/images/tokens/${synth.underlyingSymbol}.png`}
												alt={synth && synth.underlyingSymbol}
												width={16}
												height={16}
											/>
										</>
									),
								},
							]}
						/>
					</div>
				</Card.Body>
			</Card>
		</>
	)
}

export default MintCard
