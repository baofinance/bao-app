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
}
