import { createContext } from 'react'
import { Bao } from '@/bao/Bao'
import React from 'react'
import { Web3Provider } from '@ethersproject/providers'

export const BaoContext = createContext<Bao | undefined>(undefined)

interface BaoProviderProps {
	children: React.ReactNode
}

export const BaoProvider: React.FC<BaoProviderProps> = ({ children }) => {
	const isBrowser = typeof window !== 'undefined'

	const provider = isBrowser && window.ethereum ? new Web3Provider(window.ethereum as any) : undefined

	const bao = isBrowser ? new Bao(provider) : undefined

	return <BaoContext.Provider value={bao}>{children}</BaoContext.Provider>
}

export default BaoProvider
