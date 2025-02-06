import useBao from '@/hooks/base/useBao'
import { useWeb3React, Web3ReactContextInterface } from '@web3-react/core'
import { useQuery } from '@tanstack/react-query'
import { providerKey } from '@/utils/index'
import { Contract } from '@ethersproject/contracts'
import multicallUtils from '@/utils/multicall'
import Config from '@/bao/lib/config'
import { Balance, WalletBalance } from '@/bao/lib/types'
import { useBlockUpdater } from '@/hooks/base/useBlock'
import { useTxReceiptUpdater } from '@/hooks/base/useTransactionProvider'
import { ethers } from 'ethers'
import { BigNumber } from 'ethers'
import { ERC20_ABI } from '@/bao/lib/abi'
import { Multicall } from 'ethereum-multicall'

const ORACLE_ABI = ['function getUnderlyingPrice(address) view returns (uint256)']
const CTOKEN_ABI = [
	'function balanceOf(address) view returns (uint256)',
	'function exchangeRateStored() view returns (uint256)',
	'function symbol() view returns (string)',
	'function borrowBalanceStored(address) view returns (uint256)',
]

const MULTICALL_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11' // Multicall3

export const useAccountBalances = (marketName: string): { balances: Balance[]; isLoading: boolean } => {
	const bao = useBao()
	const { account, library, chainId } = useWeb3React()

	const enabled = !!bao && !!account && !!chainId && !!marketName && !!library
	const {
		data: balances,
		isLoading,
		refetch,
	} = useQuery(
		['@/hooks/lend/useAccountBalances', providerKey(library, chainId?.toString()), { enabled, marketName }],
		async () => {
			try {
				const market = Config.vaults[marketName]
				if (!market) throw new Error(`Market ${marketName} not found`)

				const signer = library.getSigner()

				console.log('Market:', market.name)
				console.log('ChainId:', chainId)
				console.log('Starting balance fetch for market:', marketName)
				console.log('Account:', account)

				const tokens = market.assets.map(asset => {
					const address = asset.ctokenAddress[chainId]
					console.log('Processing token:', asset.name, address)
					if (!address) throw new Error(`cToken address not found for ${asset.name} on chain ${chainId}`)
					return address
				})

				const BATCH_SIZE = 10
				const results = []

				for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
					const batchTokens = tokens.slice(i, i + BATCH_SIZE)
					const contracts = batchTokens.map(address => new ethers.Contract(address, CTOKEN_ABI, signer))

					const callContext = contracts.map(contract => ({
						ref: contract.address,
						contract,
						calls: [
							{ method: 'balanceOf', params: [account] },
							{ method: 'exchangeRateStored' },
							{ method: 'symbol' },
							{ method: 'borrowBalanceStored', params: [account] },
						],
					}))

					try {
						const multicallResult = await bao.multicall.call(multicallUtils.createCallContext(callContext))
						const batchRes = multicallUtils.parseCallResults(multicallResult)
						results.push(...Object.entries(batchRes))
					} catch (err) {
						console.error('Multicall batch failed:', err)
						continue
					}
				}

				console.log('Multicall results:', results)

				return Promise.all(
					market.assets.map(async (asset, i) => {
						const ctokenAddress = asset.ctokenAddress[chainId]
						if (!ctokenAddress) return null

						const result = results.find(([addr]) => addr.toLowerCase() === ctokenAddress.toLowerCase())
						if (!result) return null

						const [_, data] = result

						const rawBalance = data[0]?.values[0] || '0'
						const rawExchangeRate = data[1]?.values[0] || '0'
						const symbol = data[2]?.values[0]
						const rawBorrowBalance = data[3]?.values[0] || '0'

						const balance = ethers.BigNumber.from(rawBalance)
						const exchangeRate = ethers.BigNumber.from(rawExchangeRate)
						const borrowBalance = ethers.BigNumber.from(rawBorrowBalance)

						console.log('Processed balance:', {
							asset: asset.name,
							ctokenAddress: ctokenAddress,
							rawBalance,
							rawExchangeRate,
							rawBorrowBalance,
							symbol,
						})

						return {
							address: ctokenAddress,
							symbol,
							balance: balance.toString(),
							exchangeRate: exchangeRate.toString(),
							borrowBalance: borrowBalance.toString(),
							balanceUSD: '0',
							decimals: asset.underlyingDecimals,
							supply: asset.supply || false,
							borrow: asset.borrow || false,
						}
					}),
				).then(results => results.filter(Boolean))
			} catch (err) {
				console.error('Account balances query failed:', err)
				return []
			}
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
			retry: 2,
		},
	)

	useBlockUpdater(refetch, 10)
	useTxReceiptUpdater(refetch)

	return { balances: balances || [], isLoading }
}

// Add retry logic and better error handling for multicall
const executeMulticallWithRetry = async (multicall: Multicall, calls: any[], retries = 3) => {
	for (let i = 0; i < retries; i++) {
		try {
			return await multicall.call(calls)
		} catch (err) {
			if (i === retries - 1) throw err
			await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))) // Exponential backoff
		}
	}
}

// Add this new helper function
const formatTokenBalance = (balance: any, decimals: number): string => {
	try {
		if (!balance) return '0'

		// Handle different balance formats
		let rawBalance: string
		if (typeof balance === 'string') {
			rawBalance = balance
		} else if (typeof balance === 'number') {
			rawBalance = balance.toString()
		} else if (balance._hex) {
			rawBalance = balance._hex
		} else if (balance.hex) {
			rawBalance = balance.hex
		} else if (balance.toString && typeof balance.toString === 'function') {
			const stringVal = balance.toString()
			// Only use toString() result if it gives us a numeric string
			if (/^[0-9]+$/.test(stringVal)) {
				rawBalance = stringVal
			} else {
				return '0'
			}
		} else {
			console.warn('Unknown balance format:', balance)
			return '0'
		}

		return ethers.utils.formatUnits(rawBalance, decimals)
	} catch (error) {
		console.error('Error formatting token balance:', error)
		return '0'
	}
}

// Process the multicall results
const processResults = (results: any, marketName: string) => {
	const balances: { [key: string]: string } = {}

	try {
		if (!results?.results) {
			console.debug('No multicall results')
			return balances
		}

		for (const asset of Config.vaults[marketName].assets) {
			const tokenAddress = asset.underlyingAddress.toLowerCase()

			// Skip ETH as it's handled separately
			if (tokenAddress === 'eth') {
				console.debug('Skipping ETH balance')
				continue
			}

			const result = results.results[asset.symbol]

			if (result?.callsReturnContext?.length > 0) {
				const balanceResult = result.callsReturnContext[0]
				const decimalsResult = result.callsReturnContext[1]

				if (balanceResult?.returnValues?.[0] && decimalsResult?.returnValues?.[0]) {
					const balance = balanceResult.returnValues[0].toString()
					const decimals = decimalsResult.returnValues[0]

					// Format the balance with ethers utils
					balances[tokenAddress] = ethers.utils.formatUnits(balance, decimals)

					console.debug(`Processed balance for ${asset.symbol}:`, {
						address: tokenAddress,
						rawBalance: balance,
						decimals,
						formattedBalance: balances[tokenAddress],
					})
				}
			}
		}
	} catch (error) {
		console.error('Error processing multicall results:', error)
	}

	return balances
}

// Update the fetchBalances function
const fetchBalances = async (marketName: string, web3Context: Web3ReactContextInterface) => {
	const { account, chainId, library } = web3Context

	try {
		if (!account || !chainId || !library) {
			console.debug('Missing web3 context')
			return {}
		}

		const market = Config.vaults[marketName]
		if (!market) {
			console.debug('Market not found:', marketName)
			return {}
		}

		// Configure multicall
		const multicall = new Multicall({
			ethersProvider: library,
			tryAggregate: true,
			multicallCustomContractAddress: MULTICALL_ADDRESS,
		})

		// Prepare contract calls for tokens (excluding ETH)
		const contractCalls = market.assets
			.filter(asset => asset.underlyingAddress[chainId]?.toLowerCase() !== 'eth')
			.map(asset => {
				const tokenAddress = asset.underlyingAddress[chainId]
				if (!tokenAddress) return null

				return {
					reference: tokenAddress.toLowerCase(),
					contractAddress: tokenAddress,
					abi: ERC20_ABI,
					calls: [
						{
							reference: 'balanceOf',
							methodName: 'balanceOf',
							methodParameters: [account],
						},
						{
							reference: 'decimals',
							methodName: 'decimals',
							methodParameters: [],
						},
					],
				}
			})
			.filter(Boolean)

		console.debug('Executing multicall with:', {
			marketName,
			account,
			callsCount: contractCalls.length,
			calls: contractCalls,
		})

		// Get token balances
		const results = await executeMulticallWithRetry(multicall, contractCalls)

		// Process token results
		const tokenBalances = {}
		if (results?.results) {
			Object.entries(results.results).forEach(([address, result]) => {
				if (result?.callsReturnContext?.length >= 2) {
					const balanceResult = result.callsReturnContext[0]
					const decimalsResult = result.callsReturnContext[1]

					if (balanceResult?.returnValues?.[0] && decimalsResult?.returnValues?.[0]) {
						// Keep the balance as a BigNumber
						tokenBalances[address.toLowerCase()] = {
							balance: ethers.BigNumber.from(balanceResult.returnValues[0]),
							decimals: decimalsResult.returnValues[0],
						}
					}
				}
			})
		}

		// Get ETH balance separately and keep it as a BigNumber
		const ethBalance = await library.getBalance(account)
		const balances = {
			eth: {
				balance: ethBalance,
				decimals: 18,
			},
			...tokenBalances,
		}

		console.debug('Final balances:', {
			eth: balances.eth.balance.toString(),
			tokens: Object.entries(tokenBalances).map(([addr, data]) => ({
				address: addr,
				balance: data.balance.toString(),
				decimals: data.decimals,
			})),
		})

		return balances
	} catch (error) {
		console.error('Error fetching balances:', error)
		return {}
	}
}

// Update the useWalletBalances hook
export const useWalletBalances = (marketName: string) => {
	const web3Context = useWeb3React()
	const { account, chainId, library } = web3Context
	const enabled = Boolean(account && chainId && marketName && library)

	const { data: walletBalances, isLoading } = useQuery(
		['@/hooks/lend/useWalletBalances', account, chainId, marketName],
		async () => {
			const balances = await fetchBalances(marketName, web3Context)
			console.debug('Fetched wallet balances:', {
				marketName,
				account,
				balances,
				keys: Object.keys(balances),
			})
			return balances
		},
		{
			enabled,
			staleTime: 30000,
			cacheTime: 60000,
			retry: 2,
		},
	)

	return { walletBalances: walletBalances || {}, isLoading }
}

// Verify the imported ABI has the methods we need
console.log(
	'ERC20_ABI methods:',
	ERC20_ABI.filter(item => item.type === 'function').map(item => item.name),
)

// The minimum required ABI should have:
const MINIMUM_ABI = [
	'function balanceOf(address) view returns (uint256)',
	'function decimals() view returns (uint8)',
	'function symbol() view returns (string)',
]

// When getting balance from contract call, ensure we get the raw string value
const formatBalance = (balance: string, decimals: number) => {
	// Parse string balance into BigNumber
	return ethers.utils.formatUnits(balance, decimals)
}
