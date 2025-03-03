import { createContext } from 'react'
import { VaultsContext } from './types'

const context = createContext<VaultsContext>({
	vaults: {}, // ✅ Correct: Initialize as an empty object instead of an array
})

export default context
