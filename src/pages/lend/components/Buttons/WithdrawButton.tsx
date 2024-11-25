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
import type { IconProp } from '@fortawesome/fontawesome-svg-core'

type WithdrawButtonProps = {
	asset: Asset
	val: BigNumber
	isDisabled: boolean
	onHide?: () => void
	marketName: string
}

const WithdrawButton = ({ asset, val, isDisabled, onHide, marketName }: WithdrawButtonProps) => {
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
					<FontAwesomeIcon icon={faExternalLink as unknown as IconProp} className='ml-2 text-baoRed' />
				</Button>
			</a>
		)
	} else {
		return (
			<Button
				fullWidth
				disabled={isDisabled}
				onClick={() => {
					handleTx(
						activeLendMarket.marketContract.redeemUnderlying(val.toString()),
						`${marketName} Withdraw ${getDisplayBalance(val, asset.underlyingDecimals)} ${asset.name}`,
						() => onHide(),
					)
				}}
			>
				Withdraw
			</Button>
		)
	}
}

export default WithdrawButton
