import { ActiveSupportedBackstop } from '@/bao/lib/types'
import Button, { NavButtons } from '@/components/Button'
import Modal from '@/components/Modal'
import Typography from '@/components/Typography'
import { useAccountLiquidity } from '@/hooks/vaults/useAccountLiquidity'
import { useSupplyBalances } from '@/hooks/vaults/useBalances'
import { useExchangeRates } from '@/hooks/vaults/useExchangeRates'
import { useVaults } from '@/hooks/vaults/useVaults'
import { decimate, exponentiate, sqrt } from '@/utils/numberFormat'
import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import Image from 'next/future/image'
import React, { useCallback, useMemo, useState } from 'react'
import Actions from './BackstopActions'

type BackstopModalProps = {
	backstop: ActiveSupportedBackstop
	show: boolean
	onHide: () => void
}

const BackstopModal: React.FC<BackstopModalProps> = ({ backstop, show, onHide }) => {
	const operations = ['Deposit', 'Withdraw', 'Stake', 'Unstake']
	const [operation, setOperation] = useState(operations[0])

	const _vaults = useVaults(backstop.name)
	const supplyBalances = useSupplyBalances(backstop.name)
	const { exchangeRates } = useExchangeRates(backstop.name)
	const exchangeRate = exchangeRates && exchangeRates[backstop.vaultAddress]

	// console.log('exchangeRate', formatUnits(exchangeRate ? exchangeRate : BigNumber.from(0)))
	const accountLiquidity = useAccountLiquidity(backstop.name)

	const synth = useMemo(() => {
		if (!_vaults) return
		return _vaults.find(vault => vault.isSynth)
	}, [_vaults])

	const supply = useMemo(
		() =>
			synth &&
			supplyBalances &&
			supplyBalances.find(balance => balance.address.toLowerCase() === synth?.vaultAddress.toLowerCase()) &&
			synth &&
			exchangeRates &&
			exchangeRates[synth?.vaultAddress]
				? decimate(
						supplyBalances
							.find(balance => balance.address.toLowerCase() === synth?.vaultAddress.toLowerCase())
							.balance.mul(exchangeRates[synth?.vaultAddress]),
				  )
				: BigNumber.from(0),
		[supplyBalances, exchangeRates, synth],
	)

	let _imfFactor = synth && synth.imfFactor
	if (accountLiquidity) {
		const _sqrt = sqrt(supply)
		const num = exponentiate(parseUnits('1.1'))
		const denom = synth ? decimate(synth?.imfFactor.mul(_sqrt).add(parseUnits('1'))) : 1
		_imfFactor = num.div(denom)
	}

	let withdrawable = BigNumber.from(0)
	if (synth && _imfFactor.gt(synth?.collateralFactor) && synth?.price.gt(0)) {
		if (synth?.collateralFactor.mul(synth?.price).gt(0)) {
			withdrawable =
				accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(synth?.collateralFactor.mul(synth?.price)))
		} else {
			withdrawable = accountLiquidity && exponentiate(accountLiquidity.usdBorrowable).div(decimate(_imfFactor).mul(synth?.price))
		}
	}

	const max = () => {
		return !(accountLiquidity && accountLiquidity.usdBorrowable) || withdrawable.gt(supply) ? supply : withdrawable
	}

	const hideModal = useCallback(() => {
		onHide()
	}, [onHide])

	return (
		<Modal isOpen={show} onDismiss={hideModal} maxWidth='2xl'>
			<Modal.Header
				onClose={hideModal}
				header={
					<>
						<Typography variant='xl' className='mr-1 inline-block'>
							{operation}
						</Typography>
						<Image className='z-10 inline-block select-none duration-200' src={backstop.icon} width={32} height={32} alt={backstop.name} />
					</>
				}
			/>
			<div className='grid grid-cols-5 gap-4'>
				<div className='col-span-3'>
					<Modal.Options>
						<NavButtons options={operations} active={operation} onClick={setOperation} />
					</Modal.Options>
					<Actions backstop={backstop} onHide={onHide} operation={operation} max={max()} exchangeRate={exchangeRate} />
				</div>
				<div className='col-span-2 border-r-1 border-baoWhite border-opacity-5 flex-row'>
					<div>
						<p className='text-sm'>1. Approve baoETH</p>
					</div>

					<p className='text-sm'>2. Deposit baoETH to Vault</p>
					<p className='text-sm'>3. Approve bdbaoETH</p>
					<p className='text-sm'>4. Stake bdbaoETH in Backstop</p>
				</div>
			</div>
		</Modal>
	)
}

export default BackstopModal
