import { Web3Provider } from '@ethersproject/providers'

let library: Web3Provider | null = null

export default function getLibrary(provider: any): Web3Provider {
	if (library) return library

	try {
		if (!provider) {
			throw new Error('No provider available')
		}

		library = new Web3Provider(provider)
		library.pollingInterval = 15000

		// Initialize network detection
		library.detectNetwork().catch(error => {
			console.warn('Initial network detection failed:', error)
		})

		// Handle network changes
		provider.on('chainChanged', () => {
			library = null // Reset library on network change
			window.location.reload()
		})

		return library
	} catch (error) {
		console.error('Error initializing Web3Provider:', error)
		throw error
	}
}
