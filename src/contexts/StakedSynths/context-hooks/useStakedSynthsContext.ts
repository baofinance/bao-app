import Config from '@/bao/lib/config'
import { ActiveSupportedStakedSynth } from '@/bao/lib/types'
import useTransactionProvider from '@/hooks/base/useTransactionProvider'
import { Cether__factory, Comptroller__factory, Ctoken__factory, Erc20__factory, VaultOracle__factory } from '@/typechain/factories'
import type { Erc20, Cether, Ctoken } from '@/typechain/index'
import { decimate, exponentiate } from '@/utils/numberFormat'
import { useWeb3React } from '@web3-react/core'
import { BigNumber, ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { Multicall, ContractCallContext, ContractCallResults } from 'ethereum-multicall'

// Define ContractCall interface
interface ContractCall {
	reference: string
	methodName: string
	methodParameters: any[]
}

type Cvault = Cether | Ctoken

export const SECONDS_PER_BLOCK = 12
export const SECONDS_PER_DAY = 24 * 60 * 60
export const BLOCKS_PER_SECOND = 1 / SECONDS_PER_BLOCK
export const BLOCKS_PER_DAY = BLOCKS_PER_SECOND * SECONDS_PER_DAY
export const DAYS_PER_YEAR = 365

const toApy = (rate: BigNumber): string => {
	const ratePerBlock = Number(ethers.utils.formatUnits(rate, 18))
	const ratePerDay = ratePerBlock * BLOCKS_PER_DAY
	const apy = (Math.pow(ratePerDay + 1, DAYS_PER_YEAR) - 1) * 100
	return apy.toFixed(18)
}

export const useStakedSynthsContext = (): { [stakedSynthName: string]: ActiveSupportedStakedSynth[] } | undefined => {
	const { library, account, chainId } = useWeb3React()
	const { transactions } = useTransactionProvider()
	const [stakedSynths, setStakedSynths] = useState<{ [stakedSynthName: string]: ActiveSupportedStakedSynth[] }>({})

	// const fetchStakedSynths = useCallback(
	// 	async (stakedSynthName: string) => {
	// 		if (!library || !chainId) return

	// 		const signerOrProvider = account ? library.getSigner() : library
	// 		const _stakedSynths = Config.stakedSynths[stakedSynthName].markets
	// 			.filter(vault => !vault.archived) // TODO- add in option to view archived vaults
	// 			.map(vault => {
	// 				const vaultAddress = vault.vaultAddresses[chainId]
	// 				const underlyingAddress = vault.underlyingAddresses[chainId]
	// 				let vaultContract: Cvault
	// 				if (underlyingAddress === 'ETH') {
	// 					vaultContract = Cether__factory.connect(vaultAddress, signerOrProvider)
	// 				} else {
	// 					vaultContract = Ctoken__factory.connect(vaultAddress, signerOrProvider)
	// 				}
	// 				let underlyingContract: Erc20 | undefined
	// 				if (underlyingAddress !== 'ETH') {
	// 					underlyingContract = Erc20__factory.connect(underlyingAddress, signerOrProvider)
	// 				}
	// 				return Object.assign({}, vault, {
	// 					vaultAddress,
	// 					vaultContract,
	// 					underlyingAddress,
	// 					underlyingContract,
	// 				})
	// 			})

	// 		const comptroller = Comptroller__factory.connect(Config.vaults[vaultName].comptroller, signerOrProvider)
	// 		const oracle = VaultOracle__factory.connect(Config.vaults[vaultName].oracle, signerOrProvider)

	// 		const multicall = new Multicall({ ethersProvider: library, tryAggregate: true })

	// 		const multicallContext: ContractCallContext[] = []

	// 		// Prepare multicall context for vault contracts
	// 		_vaults.forEach(vault => {
	// 			const contractCalls: ContractCall[] = [
	// 				{ reference: 'reserveFactorMantissa', methodName: 'reserveFactorMantissa', methodParameters: [] },
	// 				{ reference: 'totalReserves', methodName: 'totalReserves', methodParameters: [] },
	// 				{ reference: 'totalBorrows', methodName: 'totalBorrows', methodParameters: [] },
	// 				{ reference: 'supplyRatePerBlock', methodName: 'supplyRatePerBlock', methodParameters: [] },
	// 				{ reference: 'borrowRatePerBlock', methodName: 'borrowRatePerBlock', methodParameters: [] },
	// 				{ reference: 'getCash', methodName: 'getCash', methodParameters: [] },
	// 				{ reference: 'totalSupply', methodName: 'totalSupply', methodParameters: [] },
	// 				{ reference: 'exchangeRateCurrent', methodName: 'exchangeRateCurrent', methodParameters: [] },
	// 				{ reference: 'symbol', methodName: 'symbol', methodParameters: [] },
	// 			]

	// 			const vaultAbi = vault.underlyingAddress === 'ETH' ? Cether__factory.abi : Ctoken__factory.abi

	// 			multicallContext.push({
	// 				reference: vault.vaultAddress,
	// 				contractAddress: vault.vaultAddress,
	// 				abi: vaultAbi,
	// 				calls: contractCalls,
	// 			})
	// 		})

	// 		// Prepare multicall context for underlying contracts
	// 		_vaults.forEach(vault => {
	// 			if (vault.underlyingContract) {
	// 				multicallContext.push({
	// 					reference: vault.underlyingAddress,
	// 					contractAddress: vault.underlyingAddress,
	// 					abi: Erc20__factory.abi,
	// 					calls: [
	// 						{
	// 							reference: 'symbol',
	// 							methodName: 'symbol',
	// 							methodParameters: [],
	// 						},
	// 					],
	// 				})
	// 			}
	// 		})

	// 		// Prepare multicall context for comptroller and oracle calls
	// 		_vaults.forEach(vault => {
	// 			// Comptroller
	// 			multicallContext.push({
	// 				reference: `comptroller-${vault.vaultAddress}`,
	// 				contractAddress: comptroller.address,
	// 				abi: Comptroller__factory.abi,
	// 				calls: [
	// 					{
	// 						reference: 'markets',
	// 						methodName: 'markets',
	// 						methodParameters: [vault.vaultAddress],
	// 					},
	// 					{
	// 						reference: 'compBorrowState',
	// 						methodName: 'compBorrowState',
	// 						methodParameters: [vault.vaultAddress],
	// 					},
	// 					{
	// 						reference: 'borrowRestricted',
	// 						methodName: 'borrowRestricted',
	// 						methodParameters: [vault.vaultAddress],
	// 					},
	// 				],
	// 			})

	// 			// Oracle
	// 			multicallContext.push({
	// 				reference: `oracle-${vault.vaultAddress}`,
	// 				contractAddress: oracle.address,
	// 				abi: VaultOracle__factory.abi,
	// 				calls: [
	// 					{
	// 						reference: 'getUnderlyingPrice',
	// 						methodName: 'getUnderlyingPrice',
	// 						methodParameters: [vault.vaultAddress],
	// 					},
	// 				],
	// 			})
	// 		})

	// 		// Add liquidationIncentiveMantissa to the multicall context
	// 		multicallContext.push({
	// 			reference: 'liquidationIncentive',
	// 			contractAddress: comptroller.address,
	// 			abi: Comptroller__factory.abi,
	// 			calls: [
	// 				{
	// 					reference: 'liquidationIncentiveMantissa',
	// 					methodName: 'liquidationIncentiveMantissa',
	// 					methodParameters: [],
	// 				},
	// 			],
	// 		})

	// 		// Execute multicall
	// 		const multicallResults: ContractCallResults = await multicall.call(multicallContext)

	// 		// Process results
	// 		const newVaults: ActiveSupportedStakedSynth[] = _vaults.map(vault => {
	// 			const vaultResults = multicallResults.results[vault.vaultAddress].callsReturnContext
	// 			const underlyingSymbol =
	// 				vault.underlyingAddress === 'ETH'
	// 					? 'ETH'
	// 					: multicallResults.results[vault.underlyingAddress].callsReturnContext.find(call => call.reference === 'symbol')
	// 							?.returnValues[0]

	// 			const comptrollerResults = multicallResults.results[`comptroller-${vault.vaultAddress}`].callsReturnContext
	// 			const oracleResults = multicallResults.results[`oracle-${vault.vaultAddress}`].callsReturnContext

	// 			const reserveFactorMantissa = vaultResults.find(call => call.reference === 'reserveFactorMantissa')?.returnValues[0]
	// 			const totalReserves = vaultResults.find(call => call.reference === 'totalReserves')?.returnValues[0]
	// 			const totalBorrows = vaultResults.find(call => call.reference === 'totalBorrows')?.returnValues[0]
	// 			const supplyRatePerBlock = vaultResults.find(call => call.reference === 'supplyRatePerBlock')?.returnValues[0]
	// 			const borrowRatePerBlock = vaultResults.find(call => call.reference === 'borrowRatePerBlock')?.returnValues[0]
	// 			const getCash = vaultResults.find(call => call.reference === 'getCash')?.returnValues[0]
	// 			const totalSupply = vaultResults.find(call => call.reference === 'totalSupply')?.returnValues[0]
	// 			const exchangeRateCurrent = vaultResults.find(call => call.reference === 'exchangeRateCurrent')?.returnValues[0]
	// 			const symbol = vaultResults.find(call => call.reference === 'symbol')?.returnValues[0]

	// 			const marketsResult = comptrollerResults.find(call => call.reference === 'markets')?.returnValues
	// 			const compBorrowStateResult = comptrollerResults.find(call => call.reference === 'compBorrowState')?.returnValues
	// 			const borrowRestrictedResult = comptrollerResults.find(call => call.reference === 'borrowRestricted')?.returnValues[0]

	// 			const liquidationIncentiveMantissa = multicallResults.results['liquidationIncentive'].callsReturnContext.find(
	// 				call => call.reference === 'liquidationIncentiveMantissa',
	// 			)?.returnValues[0]

	// 			const underlyingPrice = oracleResults.find(call => call.reference === 'getUnderlyingPrice')?.returnValues[0]

	// 			const supplyApy = parseUnits(toApy(BigNumber.from(supplyRatePerBlock)))
	// 			const borrowApy = parseUnits(toApy(BigNumber.from(borrowRatePerBlock)))

	// 			const vaultConfig = vault

	// 			return {
	// 				symbol,
	// 				underlyingSymbol,
	// 				supplyApy,
	// 				borrowApy,
	// 				liquidity: BigNumber.from(getCash),
	// 				totalReserves: BigNumber.from(totalReserves),
	// 				totalBorrows: BigNumber.from(totalBorrows),
	// 				collateralFactor: BigNumber.from(marketsResult[1]),
	// 				imfFactor: BigNumber.from(marketsResult[2]),
	// 				reserveFactor: BigNumber.from(reserveFactorMantissa),
	// 				supplied: decimate(BigNumber.from(exchangeRateCurrent).mul(BigNumber.from(totalSupply))),
	// 				borrowable: BigNumber.from(compBorrowStateResult[1]).gt(0),
	// 				liquidationIncentive: decimate(BigNumber.from(liquidationIncentiveMantissa).mul(10).sub(exponentiate(1))),
	// 				borrowRestricted: borrowRestrictedResult,
	// 				price: BigNumber.from(underlyingPrice),
	// 				...vaultConfig,
	// 			}
	// 		})

	// 		setVaults(ms => ({
	// 			...ms,
	// 			[vaultName]: newVaults,
	// 		}))
	// 	},
	// 	[account, chainId, library],
	// )

	// useEffect(() => {
	// 	if (!library || !chainId) return
	// 	fetchVaults('baoUSD')
	// 	fetchVaults('baoETH')
	// }, [fetchVaults, library, chainId, transactions])

	return stakedSynths
}
