import { ActiveSupportedStakedSynth } from '@/bao/lib/types'
import { Context, StakedSynthsContext } from '@/contexts/StakedSynths'
import { useContext } from 'react'

export const useStakedSynths = (stakedSynthName: string): ActiveSupportedStakedSynth[] | undefined => {
	const { stakedSynths }: StakedSynthsContext = useContext(Context)
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	return stakedSynths[stakedSynthName]
}
