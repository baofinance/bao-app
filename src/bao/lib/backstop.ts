// import { BigNumber } from 'ethers'
// import { formatUnits } from 'ethers/lib/utils'
// import { getOraclePrice, getSymbol } from '../utils'
// import { ActiveSupportedBackstop } from './types'
// import useContract from '@/hooks/base/useContract'
// import useBao from '@/hooks/base/useBao'

// export type TVL = {
// 	tvl: BigNumber
// }

// export const getTvl = async (backstop: ActiveSupportedBackstop, ethPrice: BigNumber): Promise<TVL> => {
// 	const backstopBalance = await backstop.vaultContract.balanceOf(backstop.backstopAddress)
// 	const exchangeRate = await backstop.vaultContract.exchangeRateStored()
// 	const totalEth = backstopBalance.mul(exchangeRate)
// 	const tvl = ethPrice.mul(totalEth).div(BigNumber.from(10).pow(36))

// 	console.log('backstopBalance', formatUnits(backstopBalance))
// 	console.log('exchangeRate', formatUnits(exchangeRate))
// 	console.log('totalEth', formatUnits(totalEth, 36))
// 	console.log('tvl', formatUnits(tvl))
// 	return {
// 		tvl: tvl,
// 	}
// }

// export type UserShareAndTotalSupply = {
// 	userShare: BigNumber
// 	totalSupply: BigNumber
// }

// export const getUserShareAndTotalSupply = async (
// 	backstop: ActiveSupportedBackstop,
// 	userAddress: string,
// ): Promise<UserShareAndTotalSupply> => {
// 	const userSharePromise = backstop.backstopContract.balanceOf(userAddress)
// 	const totalSupplyPromise = backstop.backstopContract.totalSupply()

// 	const [userShare, totalSupply] = await Promise.all([userSharePromise, totalSupplyPromise])
// 	return { userShare, totalSupply }
// }

// export const getUsdToShare = async (backstop: ActiveSupportedBackstop, amount: BigNumber) => {
// 	const totalSupply = await backstop.backstopContract.totalSupply()
// 	const { tvl } = await getTvl(backstop)
// 	const share = amount.mul(totalSupply).div(tvl)
// 	return share
// }

// export const getUserShareInUsd = async (backstop: ActiveSupportedBackstop, userAddress: string) => {
// 	const tvlPromise = getTvl(backstop)
// 	const sharePromise = getUserShareAndTotalSupply(backstop, userAddress)
// 	const [{ tvl }, { userShare, totalSupply }] = await Promise.all([tvlPromise, sharePromise])

// 	let usdVal
// 	if (totalSupply.isZero()) {
// 		usdVal = BigNumber.from(0)
// 	} else {
// 		usdVal = tvl.mul(userShare).div(totalSupply)
// 	}

// 	return usdVal
// }

// export const getAssetDistrobution = async (library: any, backstop: ActiveSupportedBackstop, userAddress: string) => {
// 	let balancePromise
// 	const assetAddress = backstop.tokenAddress
// 	if (assetAddress == '0x0000000000000000000000000000000000000000') {
// 		// handel ETH
// 		balancePromise = library.getBalance(backstop.vaultAddress)
// 	} else {
// 		balancePromise = backstop.tokenContract.balanceOf(userAddress)
// 	}

// 	const [poolBalance, symbol] = await Promise.all([balancePromise, getSymbol(backstop.tokenContract)])

// 	return {
// 		assetAddress,
// 		poolBalance,
// 		symbol,
// 	}
// }

// export const getCollaterals = async (library: any, backstop: ActiveSupportedBackstop) => {
// 	const promises = []
// 	for (let i = 0; i < 10; i++) {
// 		const promise = backstop.backstopContract
// 			.collaterals(i)
// 			.then(address => getAssetDistrobution(library, backstop, address))
// 			.catch(err => null)
// 		promises.push(promise)
// 	}
// 	const collaterals = (await Promise.all(promises)).filter(x => x)
// 	return collaterals
// }

// // export const getApr = async ({ poolAddress: bammAddress, tokenAddress: vstTokenAddress, web3 }) => {
// // 	// get vesta price
// // 	const { Contract } = web3.eth
// // 	const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=vesta-finance&vs_currencies=USD')
// // 	const vestaPrice = Number(response.data['vesta-finance']['usd'])

// // 	const bammContract = new Contract(abi.bamm, bammAddress)

// // 	const stabilityPoolAddress = await bammContract.methods.SP().call()
// // 	const stabilityPoolContract = new Contract(abi.stabilityPool, stabilityPoolAddress)

// // 	const communityIssuanceAddress = await stabilityPoolContract.methods.communityIssuance().call()
// // 	const communityIssuanceContract = new Contract(abi.communityIssuance, communityIssuanceAddress)

// // 	const vestaPerMinute = Number(
// // 		web3.utils.fromWei(await communityIssuanceContract.methods.vstaDistributionsByPool(stabilityPoolAddress).call()),
// // 	)
// // 	const minutesPerYear = 365 * 24 * 60
// // 	const vestaPerYearInUSD = vestaPerMinute * minutesPerYear * vestaPrice

// // 	const vstContract = new Contract(abi.erc20, vstTokenAddress)
// // 	const balanceOfSp = Number(web3.utils.fromWei(await vstContract.methods.balanceOf(stabilityPoolAddress).call()))

// // 	//console.log({vestaPerYearInUSD}, {balanceOfSp}, {vestaPrice}, {minutesPerYear}, {vestaPerMinute})

// // 	const apr = (vestaPerYearInUSD * 100) / balanceOfSp

// // 	console.log(bammAddress, { apr })

// // 	return apr
// // }
