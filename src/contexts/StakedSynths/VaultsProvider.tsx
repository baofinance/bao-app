import React from 'react'
import { PropsWithChildren } from 'react'

import Context from './context'
import { useStakedSynthsContext } from './context-hooks/useStakedSynthsContext'

interface StakedSynthsProviderProps {
	children: any
}
const StakedSynthsProvider: React.FC<PropsWithChildren<StakedSynthsProviderProps>> = ({ children }) => {
	const stakedSynths = useStakedSynthsContext()

	return (
		<Context.Provider
			value={{
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				//@ts-ignore
				stakedSynths,
			}}
		>
			{children}
		</Context.Provider>
	)
}

export default StakedSynthsProvider
