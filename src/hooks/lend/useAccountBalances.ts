import useBao from '@/hooks/base/useBao'
import { useWeb3React } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import MultiCall from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { Balance } from '@/bao/lib/types'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers'

const ORACLE_ABI = ['function getUnderlyingPrice(address) view returns (uint256)']
const CTOKEN_ABI = [
	'function balanceOf(address) view returns (uint256)',
	'function exchangeRateStored() view returns (uint256)',
	'function symbol() view returns (string)',
]

export const useAccountBalances = (marketName: string): Balance[] => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName && !!library
	const { data: balances, refetch } = useQuery(
		['@/hooks/lend/useAccountBalances', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			const market = Config.vaults[marketName]
			if (!market) throw new Error(`Market ${marketName} not found`)

			const signer = library.getSigner()
			const oracleAddress = market.oracle[chainId]
			let oracle: Contract | null = null

			if (oracleAddress && oracleAddress !== 'x') {
				oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, signer)
			}

			const tokens = market.assets.map(asset => {
				const address = asset.ctokenAddress[chainId]
				if (!address) throw new Error(`cToken address not found for ${asset.name} on chain ${chainId}`)
				return address
			})
			const contracts = tokens.map(address => new ethers.Contract(address, CTOKEN_ABI, signer))

			const callContext = contracts.map(contract => ({
				ref: contract.address,
				contract,
				calls: [{ method: 'balanceOf', params: [account] }, { method: 'exchangeRateStored' }, { method: 'symbol' }],
			}))

			const multicallResult = await bao.multicall.call(MultiCall.createCallContext(callContext))
			const res = MultiCall.parseCallResults(multicallResult)

			return Promise.all(
				market.assets.map(async (asset, i) => {
					const address = asset.ctokenAddress[chainId]
					if (!address) throw new Error(`cToken address not found for ${asset.name} on chain ${chainId}`)

					const rawBalance = res[address][0].values[0] || '0'
					const rawExchangeRate = res[address][1].values[0] || '0'
					const symbol = res[address][2].values[0]

					const balance = ethers.BigNumber.from(rawBalance)
					const exchangeRate = ethers.BigNumber.from(rawExchangeRate)

					let price = ethers.constants.Zero
					if (oracle) {
						try {
							price = await oracle.getUnderlyingPrice(address)
						} catch (err) {
							console.warn(`Failed to get price for ${asset.name}:`, err)
						}
					}

					const balanceUnderlying = balance.mul(exchangeRate).div(ethers.constants.WeiPerEther)
					const balanceUSD = balanceUnderlying.mul(price).div(ethers.constants.WeiPerEther)

					return {
						address: asset.underlyingAddress[chainId],
						symbol,
						balance: balanceUnderlying.toString(),
						balanceUSD: balanceUSD.toString(),
						decimals: asset.underlyingDecimals,
						supply: asset.supply || false,
						borrow: asset.borrow || false,
					}
				}),
			)
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return balances || []
}
