/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { NestRedeem, NestRedeemInterface } from '../NestRedeem'

const _abi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_weth',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_sushiRouter',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_recipe',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_lendingRegistry',
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
		name: 'recipe',
		outputs: [
			{
				internalType: 'contract IRecipe',
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
				name: '_basketAddress',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: '_basketAmount',
				type: 'uint256',
			},
		],
		name: 'redeemBasketToWeth',
		outputs: [],
		stateMutability: 'nonpayable',
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
		inputs: [
			{
				internalType: 'address',
				name: '_newLendingRegistry',
				type: 'address',
			},
		],
		name: 'updateLendingRegistry',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_newRecipe',
				type: 'address',
			},
		],
		name: 'updateRecipe',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_newSushiRouter',
				type: 'address',
			},
		],
		name: 'updateSushiRouter',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
]

export class NestRedeem__factory {
	static readonly abi = _abi
	static createInterface(): NestRedeemInterface {
		return new utils.Interface(_abi) as NestRedeemInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): NestRedeem {
		return new Contract(address, _abi, signerOrProvider) as NestRedeem
	}
}
