/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import Input from '@/components/Input'
import { parseUnits } from 'ethers/lib/utils'
import { BigNumber } from 'ethers'
import RepayButton from '@/pages/lend/components/Buttons/RepayButton'
import { useBorrowBalances } from '@/hooks/lend/useBorrowBalances'
import { useAccountBalances } from '@/hooks/lend/useAccountBalances'
import { getDisplayBalance } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'

export type RepayModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const RepayModal = ({ asset, show, onHide, marketName }: RepayModalProps) => {
	const { chainId } = useWeb3React()
	const operation = 'Repay'
	const accountBalances = useAccountBalances(marketName)
	const borrowBalances = useBorrowBalances(marketName)

	const maxRepay = useMemo(() => {
		if (!borrowBalances || !accountBalances) return BigNumber.from(0)

		const borrowBalance = borrowBalances.find(
			balance => balance.address.toLowerCase() === asset.marketAddress[chainId].toLowerCase(),
		)?.balance
		const accountBalance = accountBalances.find(
			balance => balance.address.toLowerCase() === asset.underlyingAddress[chainId].toLowerCase(),
		)?.balance

		if (!borrowBalance || !accountBalances) return BigNumber.from(0)

		return accountBalance.lt(borrowBalance) ? accountBalance : borrowBalance
	}, [borrowBalances, accountBalances])

	const maxRepayFormatted = useMemo(() => {
		return maxRepay ? getDisplayBalance(maxRepay) : null
	}, [maxRepay])

	const [val, setVal] = useState(BigNumber.from(0))
	const [formattedVal, setFormattedVal] = useState('0.00')

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			const value = e.currentTarget.value

			setFormattedVal(value)

			if (!value || isNaN(Number(value))) {
				return
			}

			setVal(parseUnits(value, asset.underlyingDecimals))
		},
		[setVal, setFormattedVal, asset],
	)

	const handleSelectMax = useCallback(() => {
		setVal(maxRepay)
		setFormattedVal(getDisplayBalance(maxRepay))
	}, [maxRepay])

	const disabled = useMemo(() => {
		return val.eq(BigNumber.from(0))
	}, [val])

	return (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
						<Typography variant='xl' className='mr-1 inline-block'>
							Repay {asset.name}
						</Typography>
						<Image src={asset.icon} width={32} height={32} alt={asset.name} />
					</div>
				</Modal.Header>
				<>
					<Modal.Body>
						<div className='mb-4 flex h-full flex-col items-center justify-center'>
							<div className='flex w-full flex-row'>
								<div className='float-left mb-1 flex w-full items-center justify-end gap-1'>
									<Typography variant='sm' className='font-bakbak text-baoRed'>
										Available:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>
										{maxRepayFormatted ? maxRepayFormatted : '0.00'}
										<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
										<span className='hover:text-baoRed'>{asset.name}</span>
									</Typography>
								</div>
							</div>
							<Typography variant='lg' className='py-5 w-full text-center font-bakbak'>
								<Input
									onSelectMax={handleSelectMax}
									onChange={handleChange}
									value={formattedVal}
									max={maxRepayFormatted}
									symbol={asset.name}
									className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
								/>
							</Typography>
						</div>
					</Modal.Body>
					<Modal.Actions>
						<RepayButton asset={asset} val={val} isDisabled={disabled} onHide={onHide} marketName={marketName} />
					</Modal.Actions>
				</>
			</Modal>
		</>
	)
}

export default RepayModal
