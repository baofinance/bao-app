import Config from '@/bao/lib/config'
import Button from '@/components/Button'
import Loader from '@/components/Loader'
import useAllowance from '@/hooks/base/useAllowance'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import type { Lusd, Erc20, Stabilizer } from '@/typechain/index'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import React, { useMemo } from 'react'

const BallastButton: React.FC<BallastButtonProps> = ({
	vaultName,
	swapDirection,
	inputVal,
	maxValues,
	supplyCap,
	reserves,
}: BallastButtonProps) => {
	const { handleTx, pendingTx, txHash } = useTransactionHandler()
	const ballast = useContract<Stabilizer>('Stabilizer', Config.vaults[vaultName].stabilizer)
	const lusdApproval = useAllowance(Config.addressMap.LUSD, ballast && ballast.address)
	const wethApproval = useAllowance(Config.addressMap.WETH, ballast && ballast.address)
	const baoUSDApproval = useAllowance(Config.addressMap.baoUSD, ballast && ballast.address)
	const baoETHApproval = useAllowance(Config.addressMap.baoETH, ballast && ballast.address)
	const lusd = useContract<Lusd>('Lusd', Config.addressMap.LUSD)
	const weth = useContract<Lusd>('Weth', Config.addressMap.WETH)
	const baoUSD = useContract<Erc20>('Erc20', Config.addressMap.baoUSD)
	const baoETH = useContract<Erc20>('Erc20', Config.addressMap.baoETH)

	const isDisabled = useMemo(
		() =>
			inputVal === '' ||
			!parseUnits(inputVal).gt(0) ||
			parseUnits(inputVal).gt(maxValues[swapDirection ? 'sell' : 'buy']) ||
			(swapDirection && parseUnits(inputVal).gt(reserves)) ||
			(!swapDirection && parseUnits(inputVal).gt(supplyCap)),
		[inputVal, maxValues, swapDirection, reserves, supplyCap],
	)

	const handleClick = async () => {
		if (isDisabled) return
		if (swapDirection) {
			// baoUSD->LUSD
			if (vaultName === 'baoUSD' ? !baoUSDApproval.gt(0) : !baoETHApproval.gt(0)) {
				const tx = (vaultName === 'baoUSD' ? baoUSD : baoETH).approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, `Ballast: Approve ${vaultName === 'baoUSD' ? 'baoUSD' : 'baoETH'}`)
			}

			handleTx(
				ballast.sell(parseUnits(inputVal).toString()),
				`Ballast: Swap ${vaultName === 'baoUSD' ? 'baoUSD for LUSD' : 'baoETH for WETH'}`,
			)
		} else {
			// LUSD->baoUSD
			if (vaultName === 'baoUSD' ? !lusdApproval.gt(0) : !wethApproval.gt(0)) {
				const tx = (vaultName === 'baoUSD' ? lusd : weth).approve(
					ballast.address,
					ethers.constants.MaxUint256, // TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
				)
				return handleTx(tx, `Ballast: Approve ${vaultName === 'baoUSD' ? 'LUSD' : 'WETH'}`)
			}

			handleTx(
				ballast.buy(parseUnits(inputVal).toString()),
				`Ballast: Swap ${vaultName === 'baoUSD' ? 'LUSD for baoUSD' : 'WETH for baoETH'}`,
			)
		}
	}

	const buttonText = () => {
		if (!(lusdApproval && baoUSDApproval && wethApproval && baoETHApproval)) return <Loader />
		if (vaultName === 'baoUSD')
			if (swapDirection) {
				return baoUSDApproval && baoUSDApproval.gt(0) ? 'Swap baoUSD for LUSD' : 'Approve baoUSD'
			} else {
				return lusdApproval && lusdApproval.gt(0) ? 'Swap LUSD for baoUSD' : 'Approve LUSD'
			}
		if (vaultName === 'baoETH')
			if (swapDirection) {
				return baoETHApproval && baoETHApproval.gt(0) ? 'Swap baoETH for WETH' : 'Approve baoETH'
			} else {
				return wethApproval && wethApproval.gt(0) ? 'Swap WETH for baoETH' : 'Approve WETH'
			}
	}

	return (
		<Button fullWidth onClick={handleClick} disabled={isDisabled} pendingTx={pendingTx} txHash={txHash}>
			{buttonText()}
		</Button>
	)
}

type BallastButtonProps = {
	vaultName: string
	swapDirection: boolean
	inputVal: string
	maxValues: { [key: string]: BigNumber }
	supplyCap: BigNumber
	reserves: BigNumber
}

export default BallastButton
