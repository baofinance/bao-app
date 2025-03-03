import { ActiveSupportedVault } from '@/bao/lib/types'

export interface VaultsContext {
	vaults: { [key: string]: ActiveSupportedVault[] } // Alternative syntax for the same thing
}
