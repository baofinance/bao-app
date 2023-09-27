/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { VaultOracle, VaultOracleInterface } from '../VaultOracle'

export const _abi = [
	{
		inputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: 'owner_',
				type: 'address',
			},
		],
		name: 'changeOwner',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'feeds',
		outputs: [
			{
				internalType: 'address',
				name: 'addr',
				type: 'address',
			},
			{
				internalType: 'uint8',
				name: 'tokenDecimals',
				type: 'uint8',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'fixedPrices',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'contract CToken',
				name: 'cToken_',
				type: 'address',
			},
		],
		name: 'getUnderlyingPrice',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'isPriceOracle',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'contract CToken',
				name: 'cToken_',
				type: 'address',
			},
		],
		name: 'removeFeed',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'contract CToken',
				name: 'cToken_',
				type: 'address',
			},
		],
		name: 'removeFixedPrice',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'contract CToken',
				name: 'cToken_',
				type: 'address',
			},
			{
				internalType: 'address',
				name: 'feed_',
				type: 'address',
			},
			{
				internalType: 'uint8',
				name: 'tokenDecimals_',
				type: 'uint8',
			},
		],
		name: 'setFeed',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'contract CToken',
				name: 'cToken_',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'price',
				type: 'uint256',
			},
		],
		name: 'setFixedPrice',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
]

export class VaultOracle__factory {
	static readonly abi = _abi
	static createInterface(): VaultOracleInterface {
		return new utils.Interface(_abi) as VaultOracleInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): VaultOracle {
		return new Contract(address, _abi, signerOrProvider) as VaultOracle
	}
}
