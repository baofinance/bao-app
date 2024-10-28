import { TransactionReceipt } from '@ethersproject/providers'
import { ethers } from 'ethers'

export type { TransactionReceipt } from '@ethersproject/providers'

export interface Transaction {
	description: string
	hash: string
	receipt?: TransactionReceipt
}

export interface TransactionsMap {
	[key: string]: Transaction
}

export interface TransactionsContext {
	transactions: Transaction[]
	addTransaction: (tx: ethers.ContractTransaction, description: string) => void
	// ... other properties
}
