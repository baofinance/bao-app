import { Theme, midnightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import merge from 'lodash.merge'

export const baoWalletConnectTheme = merge(midnightTheme(), {
	colors: {
		accentColor: '#e21a53',
		modalBorder: '#e21a53',
	},
} as Theme)
