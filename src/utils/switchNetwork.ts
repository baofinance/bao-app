import { MetaMaskInpageProvider } from '@metamask/providers'

declare global {
	interface Window {
		ethereum?: MetaMaskInpageProvider
	}
}

interface ChainConfig {
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

const CHAIN_CONFIGS: { [chainId: number]: ChainConfig } = {
	1: {
		chainId: '0x1',
		rpcUrls: [process.env.NEXT_PUBLIC_ALCHEMY_API_URL || ''],
		blockExplorerUrls: ['https://etherscan.io'],
		chainName: 'Ethereum Mainnet',
		nativeCurrency: {
			name: 'ETH',
			symbol: 'ETH',
			decimals: 18,
		},
	},
	137: {
		chainId: '0x89',
		rpcUrls: [process.env.NEXT_PUBLIC_ALCHEMY_POLY_API_URL || ''],
		blockExplorerUrls: ['https://polygonscan.com'],
		chainName: 'Polygon Mainnet',
		nativeCurrency: {
			name: 'MATIC',
			symbol: 'MATIC',
			decimals: 18,
		},
	},
}

export const switchNetwork = async (chainId: number): Promise<void> => {
	if (!window.ethereum) {
		throw new Error('No ethereum provider found. Please install MetaMask or another Web3 wallet.')
	}

	const chainConfig = CHAIN_CONFIGS[chainId]
	if (!chainConfig) {
		throw new Error(`Unsupported chain ID: ${chainId}`)
	}

	// Check if already on the target chain
	const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })
	const currentChainIdNum = typeof currentChainId === 'string' ? parseInt(currentChainId, 16) : currentChainId
	if (currentChainIdNum === chainId) {
		return // Already on the correct chain
	}

	// Set up listener before making the request
	let chainChangedHandler: ((...args: unknown[]) => void) | null = null

	try {
		const chainChangePromise = new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => {
				if (chainChangedHandler) {
					window.ethereum?.removeListener('chainChanged', chainChangedHandler)
				}
				reject(new Error('Network switch timeout'))
			}, 10000) // 10 second timeout

			chainChangedHandler = (...args: unknown[]) => {
				// ChainId comes as hex string, convert to number for comparison
				const newChainId = args[0] as string
				const newChainIdNum = parseInt(newChainId, 16)
				if (newChainIdNum === chainId) {
					clearTimeout(timeout)
					if (chainChangedHandler) {
						window.ethereum?.removeListener('chainChanged', chainChangedHandler)
					}
					resolve()
				}
			}

			window.ethereum?.on('chainChanged', chainChangedHandler)
		})

		// Try to switch to the chain
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: chainConfig.chainId }],
		})

		// Wait for the chain change event to confirm the switch
		await chainChangePromise
	} catch (error: any) {
		// Clean up listener if request failed
		if (chainChangedHandler) {
			window.ethereum?.removeListener('chainChanged', chainChangedHandler)
		}

		// If the chain is not added to the wallet, add it
		if (error.code === 4902) {
			await window.ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [chainConfig],
			})

			// After adding, wait for chain change
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => {
					reject(new Error('Network switch timeout after adding chain'))
				}, 10000)

				const handleChainChanged = (...args: unknown[]) => {
					const newChainId = args[0] as string
					const newChainIdNum = parseInt(newChainId, 16)
					if (newChainIdNum === chainId) {
						clearTimeout(timeout)
						window.ethereum?.removeListener('chainChanged', handleChainChanged)
						resolve()
					}
				}

				window.ethereum?.on('chainChanged', handleChainChanged)
			})
		} else {
			// Re-throw other errors
			throw error
		}
	}
}
