/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset, Balance } from '@/bao/lib/types'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import Input from '@/components/Input'
import { decimate } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useExchangeRates } from '@/hooks/lend/useExchangeRate'
import { parseUnits } from 'ethers/lib/utils'
import WithdrawButton from '@/pages/lend/components/Buttons/WithdrawButton'
import { useSupplyBalances } from '@/hooks/lend/useSupplyBalances'

export type WithdrawModalProps = {
	asset: Asset
	show: boolean
	onHide: () => void
	marketName: string
}

const WithdrawModal = ({ asset, show, onHide, marketName }: WithdrawModalProps) => {
	const { chainId } = useWeb3React()
	const supplyBalances = useSupplyBalances(marketName)
	const { exchangeRates } = useExchangeRates(marketName)
	const [val, setVal] = useState('0')
	const operation = 'Withdraw'
	const [formattedBalance, setFormattedBalance] = useState('0.00')

	const handleChange = useCallback(
		(e: React.FormEvent<HTMLInputElement>) => {
			setVal(e.currentTarget.value)
		},
		[setVal],
	)

	const supplied = useMemo(
		() =>
			supplyBalances &&
			supplyBalances.find(balance => balance.address.toLowerCase() === asset.marketAddress[chainId].toLowerCase()) &&
			exchangeRates &&
			exchangeRates[asset.marketAddress[chainId]]
				? decimate(
						supplyBalances
							.find(balance => balance.address.toLowerCase() === asset.marketAddress[chainId].toLowerCase())
							.balance.mul(exchangeRates[asset.marketAddress[chainId]]),
					)
				: BigNumber.from(0),
		[supplyBalances, exchangeRates, asset.marketAddress[chainId]],
	)

	const handleSelectMax = useCallback(() => {
		if (!supplied) return setVal('0')
		setVal(supplied.toString())
	}, [supplied])

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<>
			<Modal isOpen={show} onDismiss={hideModal}>
				<Modal.Header onClose={hideModal}>
					<div className='mx-0 my-auto flex h-full items-center text-baoWhite'>
						<Typography variant='xl' className='mr-1 inline-block'>
							Withdraw {asset.name}
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
										Withdrawable:
									</Typography>
									<Typography variant='sm' className='font-bakbak'>
										{formattedBalance}
										<Image src={asset.icon} width={32} height={32} alt={asset.name} className='inline p-1' />
										<span className='hover:text-baoRed'>{asset.name}</span>
									</Typography>
								</div>
							</div>
							<Typography variant='lg' className='py-5 w-full text-center font-bakbak'>
								<Input
									onSelectMax={handleSelectMax}
									onChange={handleChange}
									value={val}
									max={supplied && supplied.toString()}
									symbol={asset.name}
									className='h-12 min-w-[150px] z-20 w-full bg-baoBlack lg:h-auto'
								/>
							</Typography>
						</div>
					</Modal.Body>
					<Modal.Actions>
						<WithdrawButton
							asset={asset}
							val={val ? parseUnits(val, asset.underlyingDecimals) : BigNumber.from(0)}
							isDisabled={!val}
							onHide={onHide}
							marketName={marketName}
						/>
					</Modal.Actions>
				</>
			</Modal>
		</>
	)
}

export default WithdrawModal
