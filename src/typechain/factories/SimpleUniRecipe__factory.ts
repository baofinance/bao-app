/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { SimpleUniRecipe, SimpleUniRecipeInterface } from '../SimpleUniRecipe'

const _abi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_lendingRegistry',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_pieRegistry',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_uniV3Router',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_uniOracle',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'previousOwner',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_basket',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_maxInput',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: '_mintAmount',
				type: 'uint256',
			},
		],
		name: 'bake',
		outputs: [
			{
				internalType: 'uint256',
				name: 'inputAmountUsed',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'outputAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'basketRegistry',
		outputs: [
			{
				internalType: 'contract IPieRegistry',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_basket',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256',
			},
		],
		name: 'getPrice',
		outputs: [
			{
				internalType: 'uint256',
				name: '_price',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_basket',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_amount',
				type: 'uint256',
			},
		],
		name: 'getPriceUSD',
		outputs: [
			{
				internalType: 'uint256',
				name: '_price',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'lendingRegistry',
		outputs: [
			{
				internalType: 'contract ILendingRegistry',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'oracle',
		outputs: [
			{
				internalType: 'contract uniOracle',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'renounceOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_basket',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_mintAmount',
				type: 'uint256',
			},
		],
		name: 'toBasket',
		outputs: [
			{
				internalType: 'uint256',
				name: 'inputAmountUsed',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'outputAmount',
				type: 'uint256',
			},
		],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'uniRouter',
		outputs: [
			{
				internalType: 'contract uniV3Router',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_newOracle',
				type: 'address',
			},
		],
		name: 'updateUniOracle',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_newRouter',
				type: 'address',
			},
		],
		name: 'updateUniRouter',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		stateMutability: 'payable',
		type: 'receive',
	},
]

export class SimpleUniRecipe__factory {
	static readonly abi = _abi
	static createInterface(): SimpleUniRecipeInterface {
		return new utils.Interface(_abi) as SimpleUniRecipeInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): SimpleUniRecipe {
		return new Contract(address, _abi, signerOrProvider) as SimpleUniRecipe
	}
}
