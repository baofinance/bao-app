import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'

export function getContract(address: string, ABI: any, library: Web3Provider): Contract {
	try {
		return new Contract(address, ABI, library.getSigner())
	} catch (error) {
		console.error('Failed to get contract', error)
		throw error
	}
}
