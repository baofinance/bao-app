import { JsonRpcProvider } from '@ethersproject/providers'

const RPC_URLS: { [chainId: number]: string } = {
	1: process.env.NEXT_PUBLIC_ALCHEMY_API_URL,
	137: process.env.NEXT_PUBLIC_ALCHEMY_POLY_API_URL,
}

const providers: { [chainId: number]: JsonRpcProvider } = {}

export const getChainProvider = (chainId: number): JsonRpcProvider => {
	if (!providers[chainId]) {
		const rpcUrl = RPC_URLS[chainId]
		if (!rpcUrl) {
			throw new Error(`No RPC URL configured for chainId ${chainId}`)
		}
		providers[chainId] = new JsonRpcProvider(rpcUrl)
	}
	return providers[chainId]
}
