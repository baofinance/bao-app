import {
	Bamm,
	Cether,
	Ctoken,
	CurveLp,
	CurveMetaPool,
	Erc20,
	Experipie,
	Gauge,
	GaugePool,
	Oven,
	PoolInfo,
	SimpleUniRecipe,
	Uni_v2_lp,
} from '@/typechain/index'
import { BigNumber } from 'ethers'

export interface SupportedBackstop {
	pid: number
	backstopAddresses: {
		[network: number]: string
	}
	vaultAddresses: {
		[network: number]: string
	}
	tokenAddresses: {
		[network: number]: string
	}
	name: string
	symbol: string
	backstopSymbol: string
	vaultSymbol: string
	type: string
	icon: string
}

export interface SupportedStakedSynth {
	stid: number
	stakedSynthAddresses: {
		[network: number]: string
	}
}

export interface SupportedGauge {
	gid: number
	name: string
	symbol: string
	type: string
	iconA: string
	iconB: string
	pairUrl: string
	balancerPoolId: string
	gaugeAddresses: {
		[network: number]: string
	}
	poolAddresses: {
		[network: number]: string
	}
	lpAddresses: {
		[network: number]: string
	}
	poolInfoAddresses: {
		[network: number]: string
	}
	active: boolean
}

export interface SupportedBasket {
	nid: number
	basketAddresses: {
		[network: number]: string
	}
	lpAddress: string
	symbol: string
	name: string
	icon: string
	cgIds: { [address: string]: string }
	llamaPools: { [address: string]: string }
	pieColors: { [asset: string]: string }
	desc: string
	swap?: string
	address: string
	basketContract: Experipie
	recipeAddress: string
	recipeContract: SimpleUniRecipe
	recipeVersion: number
	ovenAddress: string
	ovenContract?: Oven
}

export interface SupportedVault {
	vid: number
	archived?: boolean
	vaultAddresses: {
		[network: number]: string
	}
	underlyingAddresses: {
		[network: number]: string
	}
	isSynth: boolean
	isBasket: boolean
	symbol: string
	icon: string
	coingeckoId: string
	underlyingDecimals: number
	underlyingSymbol?: string
	supplyApy?: BigNumber
	borrowApy?: BigNumber
	rewardApy?: BigNumber
	liquidity?: BigNumber
	collateralFactor?: BigNumber
	imfFactor?: BigNumber
	reserveFactor?: BigNumber
	totalBorrows?: BigNumber
	totalReserves?: BigNumber
	supplied?: BigNumber
	borrowable?: boolean
	liquidationIncentive?: BigNumber
	borrowRestricted?: boolean
	price?: BigNumber
	desc?: string
	minimumBorrow?: number
}

export interface ActiveSupportedBackstop extends SupportedBackstop {
	backstopAddress: string
	vaultAddress: string
	tokenAddress: string
	backstopContract: Bamm
	vaultContract: Ctoken
	tokenContract?: Erc20
}

export interface ActiveSupportedStakedSynth extends SupportedStakedSynth {
	backstopAddress: string
	vaultAddress: string
	tokenAddress: string
	backstopContract: Bamm
	vaultContract: Ctoken
	tokenContract?: Erc20
}

export interface ActiveSupportedGauge extends SupportedGauge {
	gaugeAddress: string
	poolAddress: string
	lpAddress: string
	poolInfoAddress: string
	gaugeContract: Gauge
	poolContract: GaugePool
	lpContract: Uni_v2_lp | CurveLp | CurveMetaPool
	poolInfoContract: PoolInfo
}

export interface ActiveSupportedBasket extends SupportedBasket {
	address: string
	basketContract: Experipie
	recipeContract: SimpleUniRecipe
	ovenContract: Oven
}

export interface ActiveSupportedVault extends SupportedVault {
	vaultAddress: string
	vaultContract: Cether | Ctoken
	underlyingAddress: string
	underlyingContract?: Erc20
}

export interface RpcConfig {
	chainId: string
	rpcUrls: string[]
	blockExplorerUrls: string[]
	chainName: string
	nativeCurrency: {
		name: string
		symbol: string
		decimals: number
	}
}

export interface AddressMapConfig {
	[name: string]: string
}

export interface ContractsConfig {
	[name: string]: {
		[networkId: number]: {
			address: string
			abi: string
		}
	}
}

export interface SubgraphConfig {
	[subgraphName: string]: {
		[networkId: number]: string
	}
}

export interface Config {
	networkId: number
	defaultRpc: RpcConfig
	addressMap: AddressMapConfig
	llamaIds: AddressMapConfig
	contracts: ContractsConfig
	subgraphs: SubgraphConfig
	backstops: SupportedBackstop[]
	baskets: SupportedBasket[]
	vaults: {
		[vaultName: string]: {
			vid: number
			comptroller: string
			oracle: string
			ballast: string
			stabilizer: string
			markets: SupportedVault[]
		}
	}
	gauges: SupportedGauge[]
	swapTokens: SwapToken[]
	assets: Asset[]
	lendMarkets: {
		[market: string]: LendMarket
	}
}

export interface SwapToken {
	id: number
	active: boolean
	tokenAddresses: {
		[network: number]: string
	}
	pools: [
		{
			poolAddress: string
			poolId: string
		},
	]
	name: string
	icon: string
	platforms: [
		{
			name: string
			url: string
			icon: string
		},
	]
}

export interface LendMarket {
	id: number
	active: boolean
	comptroller: string
	oracle: string
	name: string
	desc: string
	marketAddresses: {
		[network: number]: string
	}
	underlyingAddresses: {
		[network: number]: string
	}
	assets: Asset[]
}

export interface ActiveLendMarket {
	marketAddress: string
	marketContract: Cether | Ctoken
	underlyingAddress: string
	underlyingContract?: Erc20
}

export interface Asset {
	id: number
	active: boolean
	marketAddress: {
		[network: number]: string
	}
	underlyingAddress: {
		[network: number]: string
	}
	underlyingDecimals: number
	name: string
	icon: string
	supply: boolean
	borrow: boolean
}

export type Balance = {
	address: string
	symbol: string
	balance: BigNumber
	decimals: number
}

export type TotalSupply = {
	address: string
	symbol: string
	totalSupply: BigNumber
	decimals: number
}
