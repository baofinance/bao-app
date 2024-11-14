import { createContext } from 'react'
import { StakedSynthsContext } from './types'

const context = createContext<StakedSynthsContext>({
	stakedSynths: [],
})

export default context
