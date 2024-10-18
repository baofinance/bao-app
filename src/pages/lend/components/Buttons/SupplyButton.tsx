/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Asset } from '@/bao/lib/types'
import Button from '@/components/Button'
import { PendingTransaction } from '@/components/Loader/Loader'
import useContract from '@/hooks/base/useContract'
import useTransactionHandler from '@/hooks/base/useTransactionHandler'
import { useApprovals } from '@/hooks/vaults/useApprovals'
import type { Erc20 } from '@/typechain/index'
import { getDisplayBalance } from '@/utils/numberFormat'
import { faExternalLink } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BigNumber, ethers } from 'ethers'
import { useWeb3React } from '@web3-react/core'
import { useActiveLendMarket } from '@/hooks/lend/useActiveLendMarket'
import { useLendMarketApprovals } from '@/hooks/lend/useLendMarketApprovals'

type SupplyButtonProps = {
	asset: Asset
	val: BigNumber
	isDisabled: boolean
	onHide?: () => void
	marketName: string
}

const SupplyButton = ({ asset, val, isDisabled, onHide, marketName }: SupplyButtonProps) => {
	const activeLendMarket = useActiveLendMarket(asset)
	const { pendingTx, handleTx, txHash } = useTransactionHandler()
	const { approvals } = useLendMarketApprovals(activeLendMarket)
	const { chainId } = useWeb3React()
	const erc20 = useContract<Erc20>('Erc20', asset.underlyingAddress[chainId])

	if (pendingTx) {
		return (
			<a href={`https://etherscan.io/tx/${txHash}`} target='_blank' aria-label='View Transaction on Etherscan' rel='noreferrer'>
				<Button fullWidth className='!rounded-full'>
					<PendingTransaction /> Pending Transaction
					<FontAwesomeIcon icon={faExternalLink} className='ml-2 text-baoRed' />
				</Button>
			</a>
		)
	} else {
		return typeof approvals != 'undefined' &&
			approvals[asset.underlyingAddress[chainId]] &&
			approvals[asset.underlyingAddress[chainId]].gt(0) ? (
			<Button
				fullWidth
				disabled={isDisabled}
				onClick={async () => {
					// @ts-ignore
					const mintTx = activeLendMarket.marketContract.mint(val, true) // TODO- Give the user the option in the SupplyModal to tick collateral on/off
					handleTx(mintTx, `${marketName} Supply ${getDisplayBalance(val, 18).toString()} ${asset.name}`, () => onHide())
				}}
			>
				Supply
			</Button>
		) : (
			<Button
				fullWidth
				disabled={!approvals}
				onClick={() => {
					// TODO- give the user a notice that we're approving max uint and instruct them how to change this value.
					const tx = erc20.approve(asset.marketAddress[chainId], val)
					handleTx(tx, `${marketName} Approve ${asset.name}`)
				}}
			>
				Approve {asset.name}
			</Button>
		)
	}
}

export default SupplyButton
