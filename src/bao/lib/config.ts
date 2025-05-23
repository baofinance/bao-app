import { Config } from './types'

export default {
	networkId: 1,
	defaultRpc: {
		chainId: '0x1',
		rpcUrls: [process.env.NEXT_PUBLIC_ALCHEMY_API_URL],
		blockExplorerUrls: ['https://etherscan.io'],
		chainName: 'Ethereum Mainnet',
		nativeCurrency: {
			name: 'ETH',
			symbol: 'ETH',
			decimals: 18,
		},
	},
	addressMap: {
		uniswapFactory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
		uniswapFactoryV2: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
		BAO: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
		BAOv2: '0xCe391315b414D4c7555956120461D21808A69F3A',
		DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
		USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
		USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
		WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
		DEAD: '0x000000000000000000000000000000000000dead',
		CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
		MKR: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
		LUSD: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
		WSTETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
		//Synths
		baoUSD: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
		baoETH: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
		//Baskets
		bDEFI: '0x583cb488eF632c3A959Aa19EcF7991731a2F728e',
		bSTBL: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
		bETH: '0xa1e3F062CE5825c1e19207cd93CEFdaD82A8A631',
		//BasePools
		baoUSDLUSD: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
		baoETHETH: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
		sBaoSynth: '0x69378e2142BE773C86c78320EAc929770d3d740E',
	},
	llamaIds: {
		wstETH: '747c1d2a-c668-4682-b9f9-296708a3dd90',
		rETH: 'd4b3c522-6127-4b89-bedf-83641cdcd2eb',
	},
	contracts: {
		Bao: {
			1: {
				address: '0x374cb8c27130e2c9e04f44303f3c8351b9de61c1',
			},
		},
		Baov2: {
			1: {
				address: '0xCe391315b414D4c7555956120461D21808A69F3A',
			},
		},
		Weth: {
			1: {
				address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
			},
		},
		wethPrice: {
			1: {
				address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
			},
		},
		bSTBL: {
			1: {
				address: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
			},
		},
		baoUSD: {
			1: {
				address: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
			},
		},
		dai: {
			1: {
				address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
			},
		},
		Lusd: {
			1: {
				address: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
			},
		},
		// Baskets
		LendingRegistry: {
			1: {
				address: '0x08a2b7D713e388123dc6678168656659d297d397',
			},
		},
		// veBAO
		GaugeController: {
			1: {
				address: '0x840e75261c2934f33C8766F6eA6235330DC1D72d',
			},
		},
		votingEscrow: {
			1: {
				address: '0x8Bf70DFE40F07a5ab715F7e888478d9D3680a2B6',
			},
		},
		Minter: {
			1: {
				address: '0x7492Aa25Dcb4013925c199Ded466Fdf9baa6A380',
			},
		},
		FeeDistributor: {
			1: {
				address: '0xa1D0CCFcCb3064D4703060400F0D7E0FE0405e13',
			},
		},
		Dai: {
			1: {
				address: '0x6b175474e89094c44da98b954eedeac495271d0f',
			},
		},
		//Used for getting pool info for Curve LPs
		PoolInfo: {
			1: {
				address: '0xe64608E223433E8a03a1DaaeFD8Cb638C14B552C',
			},
		},
		// Distribution
		BaoDistribution: {
			1: {
				address: '0x885D90A424f87D362C9369C0F3d9A2d28AF495F4',
			},
		},
		// Token clain
		BaoClaim: {
			1: {
				address: '0x79f149a94b5b26f0b18077e7a628cf9d899f488e',
			},
		},
		Swapper: {
			1: {
				address: '0x235b30088E66d2D28F137b422B9349fBa51E0248',
			},
		},
		// Balancer
		BalancerVault: {
			1: {
				address: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
			},
		},
		// B.Protocol
		bbdbaoETH: {
			1: {
				address: '0x070B0223E244C94f3F77A993504d073DEB5386C6',
			},
		},
	},
	subgraphs: {
		sushiExchange: {
			1: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
		},
		baoBurn: {
			1: 'https://api.thegraph.com/subgraphs/name/clabby/bao-burn',
		},
		baoMarkets: {
			1: 'https://api.thegraph.com/subgraphs/name/baofinance/bao-markets',
		},
		curve: {
			1: 'https://api.thegraph.com/subgraphs/name/messari/curve-finance-ethereum',
		},
		aura: {
			1: 'https://data.aura.finance/graphql',
		},
	},
	stakedSynths: {
		sbaoUSD: {
			1: '0x0000000000000000000000000000000000000000',
		},
		sbaoETH: {
			1: '0x0000000000000000000000000000000000000000',
		},
	},
	vaults: {
		baoUSD: {
			vid: 1,
			comptroller: '0x0Be1fdC1E87127c4fe7C05bAE6437e3cf90Bf8d8',
			oracle: '0xEbdC2D2a203c17895Be0daCdf539eeFC710eaFd8',
			stabilizer: '0x93C825F8B1F420fB07412Bc4E588b59f4f340384',
			markets: [
				{
					mid: 4,
					symbol: 'bdETH',
					vaultAddresses: {
						1: '0xF635fdF9B36b557bD281aa02fdfaeBEc04CD084A',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
					archived: false,
				},
				{
					mid: 1,
					symbol: 'bdUSD',
					vaultAddresses: {
						1: '0xc0601094C0C88264Ba285fEf0a1b00eF13e79347',
					},
					underlyingAddresses: {
						1: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
					},
					isSynth: true,
					icon: 'baoUSD-pink.svg',
					coingeckoId: 'dai',
					underlyingSymbol: 'baoUSD',
					underlyingDecimals: 18,
					desc: 'Synthetic USD',
					minimumBorrow: 5000,
				},
				{
					mid: 3,
					symbol: 'bdUSDC',
					archived: true,
					vaultAddresses: {
						1: '0x7749f9f3206A49d4c47b60db05716409dC3A4149',
					},
					underlyingAddresses: {
						1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
					},
					icon: 'USDC.png',
					coingeckoId: 'usd-coin',
					underlyingDecimals: 6,
				},
				{
					mid: 5,
					isBasket: true,
					symbol: 'bdSTBL',
					vaultAddresses: {
						1: '0xE0a55c00E6510F4F7df9af78b116B7f8E705cA8F',
					},
					underlyingAddresses: {
						1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
					},
					icon: 'bSTBL.png',
					coingeckoId: 'dai',
					underlyingDecimals: 18,
					archived: true,
				},
				{
					mid: 2,
					symbol: 'bdETH',
					archived: true,
					vaultAddresses: {
						1: '0xe7a52262C1934951207c5fc7A944A82D283C83e5',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
				},
				{
					mid: 6,
					symbol: 'bdWSTETH',
					archived: false,
					vaultAddresses: {
						1: '0x62CfE0b2763f45Ea07FF119A83ed1F0ae2f73F42',
					},
					underlyingAddresses: {
						1: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
					},
					icon: 'wstETH.png',
					coingeckoId: 'wrapped-steth',
					underlyingDecimals: 18,
				},
				{
					mid: 7,
					symbol: 'bdrETH',
					archived: false,
					vaultAddresses: {
						1: '0x18fabEAc59123224E6409d4DA620ac164378912A',
					},
					underlyingAddresses: {
						1: '0xae78736Cd615f374D3085123A210448E74Fc6393',
					},
					icon: 'rETH.png',
					coingeckoId: 'rocket-pool-eth',
					underlyingDecimals: 18,
				},
			],
		},
		baoETH: {
			vid: 2,
			comptroller: '0x8e8C327AD3Fa97092cdAba70efCf82DaC3081fa1',
			oracle: '0xbCb0a842aF60c6F09827F34841d3A8770995c6e0',
			stabilizer: '0xC137fa40Ff0cb53ff157e1dCafc7262877069219',
			markets: [
				{
					mid: 4,
					symbol: 'bdEther',
					vaultAddresses: {
						1: '0x104079a87CE46fe2Cf27b811f6b406b69F6872B3',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
					archived: false,
				},
				{
					mid: 1,
					symbol: 'bdbaoETH',
					vaultAddresses: {
						1: '0xe853E5c1eDF8C51E81bAe81D742dd861dF596DE7',
					},
					underlyingAddresses: {
						1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
					},
					isSynth: true,
					icon: 'baoETH-pink.svg',
					coingeckoId: 'dai',
					underlyingSymbol: 'baoETH',
					underlyingDecimals: 18,
					desc: 'Synthetic ETH',
					minimumBorrow: 2,
				},
				{
					mid: 2,
					symbol: 'bdbETH',
					vaultAddresses: {
						1: '0xf7548a6e9DAf2e4689CEDD8A08189d0D6f3Ee91b',
					},
					underlyingAddresses: {
						1: '0xa1e3f062ce5825c1e19207cd93cefdad82a8a631',
					},
					icon: 'bETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
					isBasket: true,
					archived: true,
				},
				{
					mid: 3,
					symbol: 'bdbSTBLArchived',
					vaultAddresses: {
						1: '0xb0f8Fe96b4880adBdEDE0dDF446bd1e7EF122C4e',
					},
					underlyingAddresses: {
						1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
					},
					icon: 'bSTBL.png',
					archived: true,
					coingeckoId: 'dai',
					underlyingDecimals: 18,
					isBasket: true,
				},
				{
					mid: 5,
					symbol: 'bdbSTBL',
					vaultAddresses: {
						1: '0x937982c5ea62bd6765bd5387e5c6b45e24cb4ff6',
					},
					underlyingAddresses: {
						1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
					},
					icon: 'bSTBL.png',
					archived: true,
					coingeckoId: 'dai',
					underlyingDecimals: 18,
					isBasket: true,
				},
				{
					mid: 6,
					symbol: 'bdWSTETH',
					archived: false,
					vaultAddresses: {
						1: '0xF998d46efF00685D5AF71Cbf9D47A4CAeB611675',
					},
					underlyingAddresses: {
						1: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
					},
					icon: 'wstETH.png',
					coingeckoId: 'wrapped-steth',
					underlyingDecimals: 18,
				},
				{
					mid: 7,
					symbol: 'bdrETH',
					archived: false,
					vaultAddresses: {
						1: '0xD9588C5D34045Bae95D2272F2A1EC39a243c7FbF',
					},
					underlyingAddresses: {
						1: '0xae78736Cd615f374D3085123A210448E74Fc6393',
					},
					icon: 'rETH.png',
					coingeckoId: 'rocket-pool-eth',
					underlyingDecimals: 18,
				},
			],
		},
		baoBTC: {
			vid: 3,
			comptroller: '0x6424B42258F1382Ba0c32cE88cdF0786E4b10c6A',
			oracle: '0xCF5a0A5C5894a32d258A456C0e5b7B1c79486537',
			stabilizer: '0x93C825F8B1F420fB07412Bc4E588b59f4f340384',
			markets: [
				{
					mid: 34,
					symbol: 'bdETH',
					vaultAddresses: {
						1: '0xB62bD0E408830A87DF1a9dd141a5ccC5323789C1',
					},
					underlyingAddresses: {
						1: 'ETH',
					},
					icon: 'ETH.png',
					coingeckoId: 'weth',
					underlyingDecimals: 18,
					archived: false,
				},
				{
					mid: 31,
					symbol: 'bdbaoBTC',
					vaultAddresses: {
						1: '0xC2A343177BFD49d1cFf9C84B848917f5d771BD73',
					},
					underlyingAddresses: {
						1: '0x22d76E6e1D9aB4072522C1bC60C85a0d5626cA2D',
					},
					isSynth: true,
					icon: 'baoBTC-pink.svg',
					coingeckoId: 'btc',
					underlyingSymbol: 'baoBTC',
					underlyingDecimals: 18,
					desc: 'Synthetic BTC',
					minimumBorrow: 0.05,
				},
				{
					mid: 32,
					symbol: 'bdWSTETH',
					archived: false,
					vaultAddresses: {
						1: '0x0F02021B9BAeCe9025Ff4DBc461be52A9FAf7668',
					},
					underlyingAddresses: {
						1: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
					},
					icon: 'wstETH.png',
					coingeckoId: 'wrapped-steth',
					underlyingDecimals: 18,
				},
				{
					mid: 33,
					symbol: 'bdrETH',
					archived: false,
					vaultAddresses: {
						1: '0x5dDfA8db90476D258dDE4967ab73b9FEcC4Ba572',
					},
					underlyingAddresses: {
						1: '0xae78736Cd615f374D3085123A210448E74Fc6393',
					},
					icon: 'rETH.png',
					coingeckoId: 'rocket-pool-eth',
					underlyingDecimals: 18,
				},
				{
					mid: 35,
					symbol: 'bdbaotBTC',
					archived: false,
					vaultAddresses: {
						1: '0x25B81E2e0255094DCcdd720a03f46B7782AffA6B',
					},
					underlyingAddresses: {
						1: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
					},
					icon: 'tBTC.png',
					coingeckoId: 'tbtc',
					underlyingDecimals: 18,
				},
			],
		},
	},
	gauges: [
		{
			gid: 1,
			gaugeAddresses: {
				1: '0x0a39eE038AcA8363EDB6876d586c5c7B9336a562',
			},
			poolAddresses: {
				1: '0x0fafafd3c393ead5f5129cfc7e0e12367088c473',
			},
			lpAddresses: {
				1: '0x0fafafd3c393ead5f5129cfc7e0e12367088c473',
			},
			poolInfoAddresses: {
				1: '0x127db66e7f0b16470bec194d0f496f9fa065d0a9',
			},
			name: 'baoUSD-3CRV',
			symbol: 'baoUSD3CRV',
			type: 'Curve',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/3CRV.png',
			pairUrl: 'https://curve.fi/#/ethereum/pools/factory-v2-84',
			active: false,
		},
		{
			gid: 2,
			gaugeAddresses: {
				1: '0x675F82DF9e2fC99F8E18D0134eDA68F9232c0Af9',
			},
			poolAddresses: {
				1: '0xa148bd19e26ff9604f6a608e22bfb7b772d0d1a3',
			},
			lpAddresses: {
				1: '0x7657ceb382013f1ce9ac7b08dd8db4f28d3a7538',
			},
			poolInfoAddresses: {
				1: '0xC4F389020002396143B863F6325aA6ae481D19CE',
			},
			name: 'bSTBL-DAI',
			symbol: 'bSTBLDAI',
			type: 'Curve',
			iconA: '/images/tokens/bSTBL.png',
			iconB: '/images/tokens/DAI.png',
			pairUrl: 'https://curve.fi/#/ethereum/pools/factory-crypto-61',
			active: false,
		},
		{
			gid: 3,
			gaugeAddresses: {
				1: '0xe7f3a90AEe824a55B0F8969b6e29698966EE0191',
			},
			poolAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			lpAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			poolInfoAddresses: {
				1: '0x8d7443530d6B03c35C9291F9E43b1D18B9cFa084',
			},
			name: 'BAO-ETH',
			symbol: 'BAOETH',
			type: 'Uniswap',
			iconA: '/images/tokens/BAO.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.uniswap.org/#/add/v2/0xCe391315b414D4c7555956120461D21808A69F3A/ETH',
			active: false,
		},
		// {
		// 	gid: 4,
		// 	gaugeAddresses: {
		// 		1: '0xFaf18D150fd1f031D1C7aCCb0a1cd93E67149597',
		// 	},
		// 	poolAddresses: {
		// 		1: '0x29ccdfc668569c2351c070255a2716ffb2bc8fb1',
		// 	},
		// 	lpAddresses: {
		// 		1: '0x67e07A06425E862C6eC922A9a54Bcb10BC97720d',
		// 	},
		// 	poolInfoAddresses: {
		// 		1: '0x29ccdfc668569c2351c070255a2716ffb2bc8fb1',
		// 	},
		// 	name: 'baoUSD-FRAXBP',
		// 	symbol: 'saddle-FRAXBP-baoUSD',
		// 	type: 'Saddle',
		// 	iconA: '/images/tokens/baoUSD.png',
		// 	iconB: '/images/tokens/saddleLPtoken.png',
		// 	pairUrl: 'https://saddle.exchange/#/pools/baoUSD-FRAXBP/deposit',
		// },
		{
			gid: 5,
			gaugeAddresses: {
				1: '0xdae71239d7f277824700dfc45b575e6aa21e2294',
			},
			poolAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			lpAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			poolInfoAddresses: {
				1: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
			},
			name: 'baoUSD-LUSD',
			symbol: 'baoUSD-LUSD',
			type: 'Balancer',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/LUSD.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x7e9afd25f5ec0eb24d7d4b089ae7ecb9651c8b1f000000000000000000000511',
			balancerPoolId: '0x7e9afd25f5ec0eb24d7d4b089ae7ecb9651c8b1f000000000000000000000511',
			active: false,
		},
		{
			gid: 6,
			gaugeAddresses: {
				1: '0x15174daafd4a72f282cf875a839d1abe9bf444c1',
			},
			poolAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			lpAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			poolInfoAddresses: {
				1: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
			},
			name: 'baoETH-ETH',
			symbol: 'baoETH-ETH',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x1a44e35d5451e0b78621a1b3e7a53dfaa306b1d000000000000000000000051b',
			balancerPoolId: '0x1a44e35d5451e0b78621a1b3e7a53dfaa306b1d000000000000000000000051b',
			active: false,
		},
		{
			gid: 7,
			gaugeAddresses: {
				1: '0x8fbcb931409d7118949b92c0ed2d692f6bcb3d92',
			},
			poolAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			lpAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			poolInfoAddresses: {
				1: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
			},
			name: 'baoUSD-LUSD/BAO',
			symbol: 'baoUSD-LUSD/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/LUSD.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x08cc92fedc1ce2d8525176a63fcff404450f2998000200000000000000000542',
			balancerPoolId: '0x08cc92fedc1ce2d8525176a63fcff404450f2998000200000000000000000542',
			active: false,
		},
		{
			gid: 8,
			gaugeAddresses: {
				1: '0x0e7b7f385dc87e515b44e05233c340d474ea9d7c',
			},
			poolAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			lpAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			poolInfoAddresses: {
				1: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
			},
			name: 'baoETH-ETH/BAO',
			symbol: 'baoETH-ETH/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x3b9fb87f7d081ceddb1289258fa5660d955317b6000200000000000000000544',
			balancerPoolId: '0x3b9fb87f7d081ceddb1289258fa5660d955317b6000200000000000000000544',
			active: false,
		},
		{
			gid: 9,
			gaugeAddresses: {
				1: '0x123Ec6701097d1C95771d0b8Fa48B0d88E7D7B62',
			},
			poolAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			lpAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			poolInfoAddresses: {
				1: '0x0Bbc7B78Ff8453c40718E290b33F1d00ee67274E',
			},
			name: 'baoETH-ETH/bETH',
			symbol: 'baoETH-ETH/bETH',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/bETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x0bbc7b78ff8453c40718e290b33f1d00ee67274e000000000000000000000563',
			balancerPoolId: '0x0bbc7b78ff8453c40718e290b33f1d00ee67274e000000000000000000000563',
			active: false,
		},
		{
			gid: 10,
			gaugeAddresses: {
				1: '0xA85708C65d9fC9478075686e25e08fd2914b99FF',
			},
			poolAddresses: {
				1: '0x070B0223E244C94f3F77A993504d073DEB5386C6',
			},
			lpAddresses: {
				1: '0x070B0223E244C94f3F77A993504d073DEB5386C6',
			},
			poolInfoAddresses: {
				1: '0x070B0223E244C94f3F77A993504d073DEB5386C6',
			},
			name: 'baoETH Backstop',
			symbol: 'bbdbaoETH',
			type: 'BProtocol',
			iconA: '/images/tokens/baoETH.png',
			pairUrl: '/backstops',
			active: false,
		},
		{
			gid: 11,
			gaugeAddresses: {
				1: '0x7deb783311039d474bafece4d08c7c8a310ee225',
			},
			poolAddresses: {
				1: '0x19DF5BB37380186bC8EFc5Ad91516373A2C5459f',
			},
			lpAddresses: {
				1: '0x19DF5BB37380186bC8EFc5Ad91516373A2C5459f',
			},
			poolInfoAddresses: {
				1: '0x19DF5BB37380186bC8EFc5Ad91516373A2C5459f',
			},
			name: 'baoETH-ETH/BAO (20/80 Pool)',
			symbol: 'baoETH-ETH/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoETH.png',
			iconB: '/images/tokens/ETH.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x19df5bb37380186bc8efc5ad91516373a2c5459f000200000000000000000698',
			balancerPoolId: '0x19df5bb37380186bc8efc5ad91516373a2c5459f000200000000000000000698',
			active: false,
		},
		{
			gid: 12,
			gaugeAddresses: {
				1: '0x402FA148926D7dd97A86B49B18EbED6C762eCaC1',
			},
			poolAddresses: {
				1: '0x9412206f58cc72b9b4e340422A95354372A3ec3D',
			},
			lpAddresses: {
				1: '0x9412206f58cc72b9b4e340422A95354372A3ec3D',
			},
			poolInfoAddresses: {
				1: '0x9412206f58cc72b9b4e340422A95354372A3ec3D',
			},
			name: 'baoUSD-LUSD/BAO (20/80 Pool)',
			symbol: 'baoUSD-LUSD/BAO',
			type: 'Balancer',
			iconA: '/images/tokens/baoUSD.png',
			iconB: '/images/tokens/LUSD.png',
			pairUrl: 'https://app.balancer.fi/#/ethereum/pool/0x9412206f58cc72b9b4e340422a95354372a3ec3d00020000000000000000069a',
			balancerPoolId: '0x9412206f58cc72b9b4e340422a95354372a3ec3d00020000000000000000069a',
			active: false,
		},
	],
	baskets: [
		{
			nid: 1,
			basketAddresses: {
				1: '0x5ee08f40b637417bcC9d2C51B62F4820ec9cF5D8',
			},
			lpAddress: '0x562385758925CF0f1Cf3363124Fa9dED981d67e3',
			recipeAddress: '0xac0fE9F363c160c281c81DdC49d0AA8cE04C02Eb',
			recipeVersion: 1,
			ovenAddress: '0x3F32068Fc7fff8d3218251561cd77EE2FefCb1A3',
			symbol: 'bSTBL',
			name: 'bSTBL',
			icon: 'bSTBL.png',
			cgIds: {
				'0x6b175474e89094c44da98b954eedeac495271d0f': 'dai',
				'0x5f98805a4e8be255a32880fdec7f6728c6568ba0': 'liquity-usd',
			},
			pieColors: {
				aSUSD: '#1FC9A8',
				aDAI: '#F5AC37',
				aLUSD: '#2775CA',
				DAI: '#F5AC37',
				LUSD: '#2775CA',
				yvLUSD: '#2775CA',
			},
			desc: 'Low risk stablecoin basket',
			swap: 'https://curve.fi/factory-crypto/61',
		},
		{
			nid: 2,
			basketAddresses: {
				1: '0xa1e3F062CE5825c1e19207cd93CEFdaD82A8A631',
			},
			lpAddress: '0x562385758925CF0f1Cf3363124Fa9dED981d67e3',
			recipeAddress: '0x600e353fa3414abdd08b5f20b20b4cd701823b9b',
			recipeVersion: 2,
			ovenAddress: '0x3F32068Fc7fff8d3218251561cd77EE2FefCb1A3',
			symbol: 'bETH',
			name: 'bETH',
			icon: 'bETH.png',
			cgIds: {
				'0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': 'wrapped-steth',
				'0xae78736cd615f374d3085123a210448e74fc6393': 'rocket-pool-eth',
			},
			pieColors: {
				wstETH: '#3AA4FF',
				rETH: '#F8AE8D',
			},
			desc: 'Liquid staked ETH basket',
			swap: 'https://curve.fi/factory-crypto/61',
		},
	],
	backstops: [
		{
			gid: 1,
			backstopAddresses: {
				1: '0x070B0223E244C94f3F77A993504d073DEB5386C6',
			},
			vaultAddresses: {
				1: '0xe853E5c1eDF8C51E81bAe81D742dd861dF596DE7',
			},
			tokenAddresses: {
				1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
			},
			name: 'baoETH',
			backstopSymbol: 'bbdbaoETH',
			vaultSymbol: 'bdbaoETH',
			type: 'B.Protocol',
			icon: '/images/tokens/baoETH.png',
		},
	],
	swapTokens: [
		{
			id: 1,
			active: true,
			tokenAddresses: {
				1: '0xce391315b414d4c7555956120461d21808a69f3a',
			},
			pools: [
				{
					poolAddress: '0x3B9Fb87F7d081CEDdb1289258FA5660d955317b6',
					poolId: '0x3b9fb87f7d081ceddb1289258fa5660d955317b6000200000000000000000544',
				},
				{
					poolAddress: '0x08cC92fEdc1cE2D8525176a63FcfF404450f2998',
					poolId: '0x08cc92fedc1ce2d8525176a63fcff404450f2998000200000000000000000542',
				},
			],
			name: 'bao',
			icon: '/images/tokens/BAO.png',
			platforms: [
				{
					pid: 1,
					name: 'LlamaSwap',
					url: 'https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&to=0xce391315b414d4c7555956120461d21808a69f3a',
					icon: '/images/platforms/llamaSwap.png',
					background: 'bg-llamaSwapBackground',
				},
			],
		},
		{
			id: 2,
			active: true,
			tokenAddresses: {
				1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
			},
			pools: [
				{
					poolAddress: '0x1A44E35d5451E0b78621A1B3e7a53DFaA306B1D0',
					poolId: '0x1a44e35d5451e0b78621a1b3e7a53dfaa306b1d000000000000000000000051b',
				},
			],
			name: 'baoETH',
			icon: '/images/tokens/baoETH-pink.svg',
			platforms: [
				{
					pid: 1,
					name: 'LlamaSwap',
					url: 'https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&to=0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
					icon: '/images/platforms/llamaSwap.png',
					background: 'bg-llamaSwapBackground',
				},
			],
		},
		{
			id: 3,
			active: true,
			tokenAddresses: {
				1: '0x7945b0a6674b175695e5d1d08ae1e6f13744abb0',
			},
			pools: [
				{
					poolAddress: '0x7E9AfD25F5Ec0eb24d7d4b089Ae7EcB9651c8b1F',
					poolId: '0x7e9afd25f5ec0eb24d7d4b089ae7ecb9651c8b1f000000000000000000000511',
				},
			],
			name: 'baoUSD',
			icon: '/images/tokens/baoUSD-pink.svg',
			platforms: [
				{
					pid: 1,
					name: 'LlamaSwap',
					url: 'https://swap.defillama.com/?chain=ethereum&from=0x0000000000000000000000000000000000000000&to=0x7945b0a6674b175695e5d1d08ae1e6f13744abb0',
					icon: '/images/platforms/llamaSwap.png',
					background: 'bg-llamaSwapBackground',
				},
			],
		},
	],
	lendMarkets: {
		weETH: {
			id: 1,
			active: true,
			name: 'weETH',
			desc: 'Wrapped eETH',
			comptroller: '0xf55044bb140DD3Eeb7372bd722C323c87d8AE798',
			oracle: '0xc7D8b6b170E0FCf4182fa29b47F35F48C402bF0F',
			marketAddresses: {
				1: '0x353A07b25c84a522356aF2D9a7c0d7FF481733e9',
			},
			underlyingAddresses: {
				1: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
			},
			assets: [
				{
					id: 1,
					active: true,
					marketAddress: {
						1: '0x353A07b25c84a522356aF2D9a7c0d7FF481733e9',
					},
					underlyingAddress: {
						1: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
					},
					underlyingDecimals: 18,
					name: 'weETH',
					icon: '/images/tokens/weETH.png',
					supply: true,
					borrow: false,
				},
				{
					id: 2,
					active: true,
					marketAddress: {
						1: '0x085c35278fDC840b9Ca74AAB226bA8E2f95C446F',
					},
					underlyingAddress: {
						1: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
					},
					underlyingDecimals: 18,
					name: 'BaoUSD',
					icon: '/images/tokens/baoUSD-pink.svg',
					supply: true,
					borrow: true,
				},
				{
					id: 3,
					active: true,
					marketAddress: {
						1: '0xdC39e6365AA75D762729513004c956D1475bED20',
					},
					underlyingAddress: {
						1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
					},
					underlyingDecimals: 18,
					name: 'BaoETH',
					icon: '/images/tokens/baoETH-pink.svg',
					supply: true,
					borrow: true,
				},
				{
					id: 4,
					active: true,
					marketAddress: {
						1: '0x357FE927DC3Ee1be7ba1423bc5485BC8CD066040',
					},
					underlyingAddress: {
						1: '0xc69Ad9baB1dEE23F4605a82b3354F8E40d1E5966',
					},
					underlyingDecimals: 18,
					name: 'PTweETHJUN',
					icon: '/images/tokens/weETH.png',
					supply: true,
					borrow: false,
				},
				{
					id: 5,
					active: true,
					marketAddress: {
						1: '0x0930B04032E52daBC2324533c015bc27Ad5B35B7',
					},
					underlyingAddress: {
						1: '0x1c085195437738d73d75DC64bC5A3E098b7f93b1',
					},
					underlyingDecimals: 18,
					name: 'PTweETHSEP',
					icon: '/images/tokens/weETH.png',
					supply: true,
					borrow: false,
				},
				{
					id: 6,
					active: true,
					marketAddress: {
						1: '0x672bf1cdE0F352296fA759BefF392997C809cd8a',
					},
					underlyingAddress: {
						1: '0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d',
					},
					underlyingDecimals: 18,
					name: 'PTweETHDEC',
					icon: '/images/tokens/weETH.png',
					supply: true,
					borrow: false,
				},
			],
		},
		USDe: {
			id: 1,
			active: true,
			name: 'USDe',
			desc: 'Ethena USDe',
			comptroller: '0x46396230c61776A384c1c00c04A9784c4a2F5d8F',
			oracle: '0xba2fdeb1d483acbdb196b39473e7af90268afa67',
			marketAddresses: {
				1: '0x680358d70b34a00f2d661bb4f95E1C14E5Dae93F',
			},
			underlyingAddresses: {
				1: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
			},
			assets: [
				{
					id: 1,
					active: true,
					marketAddress: {
						1: '0x680358d70b34a00f2d661bb4f95E1C14E5Dae93F',
					},
					underlyingAddress: {
						1: '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
					},
					underlyingDecimals: 18,
					name: 'USDe',
					icon: '/images/tokens/USDe.png',
					supply: true,
					borrow: false,
				},
				{
					id: 2,
					active: true,
					marketAddress: {
						1: '0xe606AE6d6394a977a8B0926557BF9D291051f989',
					},
					underlyingAddress: {
						1: '0x7945b0A6674b175695e5d1D08aE1e6F13744Abb0',
					},
					underlyingDecimals: 18,
					name: 'BaoUSD',
					icon: '/images/tokens/baoUSD-pink.svg',
					supply: true,
					borrow: true,
				},
				{
					id: 3,
					active: true,
					marketAddress: {
						1: '0xDe10BEd5236B786cAA18Ca39FFa5de1b904a8a94',
					},
					underlyingAddress: {
						1: '0xf4edfad26EE0D23B69CA93112eccE52704E0006f',
					},
					underlyingDecimals: 18,
					name: 'BaoETH',
					icon: '/images/tokens/baoETH-pink.svg',
					supply: true,
					borrow: true,
				},
				{
					id: 4,
					active: true,
					marketAddress: {
						1: '0xD011778057AA740BB3703Ad4d78b3c79a1aED1cb',
					},
					underlyingAddress: {
						1: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
					},
					underlyingDecimals: 18,
					name: 'sUSDe',
					icon: '/images/tokens/sUSDe.png',
					supply: true,
					borrow: false,
				},
				{
					id: 5,
					active: true,
					marketAddress: {
						1: '0x3d881b3C7B690f05E672cD0F8fCbC0aE3A7292CF',
					},
					underlyingAddress: {
						1: '0xa0021EF8970104c2d008F38D92f115ad56a9B8e1',
					},
					underlyingDecimals: 18,
					name: 'PTUSDeJUL',
					icon: '/images/tokens/USDe.png',
					supply: true,
					borrow: false,
				},
				{
					id: 6,
					active: true,
					marketAddress: {
						1: '0x4cd395CB5edF33b44E73257ee614413f95d1a6cD',
					},
					underlyingAddress: {
						1: '0x6c9f097e044506712B58EAC670c9a5fd4BCceF13',
					},
					underlyingDecimals: 18,
					name: 'PTsUSDeSEP',
					icon: '/images/tokens/sUSDe.png',
					supply: true,
					borrow: false,
				},
			],
		},
	},
} as unknown as Config
