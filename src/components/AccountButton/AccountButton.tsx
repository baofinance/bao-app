import { faAngleDoubleRight, faLink, faReceipt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import AccountModal from '../AccountModal'
import Button from '../Button'
import Loader from '../Loader'
import WalletProviderModal from '../WalletProviderModal'
import { default as UDResolution } from '@unstoppabledomains/resolution'

const udResolution = new UDResolution()
async function udReverseAddress(address: string): Promise<string> {
	const domain = await udResolution.reverse(address)
	return domain
}

interface AccountButtonProps {}

const AccountButton: React.FC<AccountButtonProps> = () => {
	const { account } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [showAccountModal, setShowAccountModal] = useState(false)
	const [showWalletProviderModal, setShowWalletProviderModal] = useState(false)
	const [ens, setEns] = useState<string | undefined>()
	const [ud, setUd] = useState<string | undefined>()

	useEffect(() => {
		const ensResolver = new ethers.providers.JsonRpcProvider(`${process.env.NEXT_PUBLIC_ALCHEMY_API_URL}`)
		if (!account) return
		ensResolver.lookupAddress(account).then(_ens => {
			if (_ens) setEns(_ens)
		})
	}, [account])

	useEffect(() => {
		if (!account) return
		udReverseAddress(account)
			.then(_ud => {
				if (_ud) setUd(_ud)
			})
			.catch(() => {
				// Silently fail - UD resolution is optional
			})
	}, [account])

	const pendingTxs = useMemo(() => Object.keys(transactions).filter(txHash => !transactions[txHash].receipt).length, [transactions])

	const vanityId = ens || ud
	const vanityAddress = account ? `${account.slice(0, 6)}...${account.slice(account.length - 4, account.length)}` : '0x0000...abcd'
	const displayId = vanityId || vanityAddress

	return (
		<>
			{!account ? (
				<Button onClick={() => setShowWalletProviderModal(true)} size='sm'>
					Connect <FontAwesomeIcon icon={faLink as IconProp} className='ml-1' />
				</Button>
			) : (
				<>
					<Button onClick={() => setShowAccountModal(true)} size='sm'>
						<div className='items-center'>
							{displayId}
							{pendingTxs > 0 && (
								<>
									<FontAwesomeIcon icon={faAngleDoubleRight as IconProp} className='mx-2 mt-1 text-baoRed' />
									<Loader />
									<span className='ml-2'>{pendingTxs}</span>
									<FontAwesomeIcon icon={faReceipt as IconProp} className='mx-2 mt-1 text-baoRed' />
								</>
							)}
						</div>
					</Button>
				</>
			)}
			<AccountModal show={showAccountModal} onHide={() => setShowAccountModal(false)} />
			<WalletProviderModal show={showWalletProviderModal} onHide={() => setShowWalletProviderModal(false)} />
		</>
	)
}

export default AccountButton
