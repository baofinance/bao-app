/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common";

export interface CreamLendingInterface extends utils.Interface {
  functions: {
    "exchangeRateCurrent()": FunctionFragment;
    "exchangeRateStored()": FunctionFragment;
    "mint(uint256)": FunctionFragment;
    "redeem(uint256)": FunctionFragment;
    "supplyRatePerBlock()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "exchangeRateCurrent"
      | "exchangeRateCurrent()"
      | "exchangeRateStored"
      | "exchangeRateStored()"
      | "mint"
      | "mint(uint256)"
      | "redeem"
      | "redeem(uint256)"
      | "supplyRatePerBlock"
      | "supplyRatePerBlock()"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "exchangeRateCurrent",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exchangeRateCurrent()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exchangeRateStored",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "exchangeRateStored()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "mint(uint256)",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "redeem(uint256)",
    values: [PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "supplyRatePerBlock",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "supplyRatePerBlock()",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "exchangeRateCurrent",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchangeRateCurrent()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchangeRateStored",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "exchangeRateStored()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "mint(uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "redeem", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "redeem(uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supplyRatePerBlock",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supplyRatePerBlock()",
    data: BytesLike
  ): Result;

  events: {};
}

export interface CreamLending extends BaseContract {
  contractName: "CreamLending";

  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: CreamLendingInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    exchangeRateCurrent(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "exchangeRateCurrent()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    exchangeRateStored(overrides?: CallOverrides): Promise<[BigNumber]>;

    "exchangeRateStored()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    mint(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "mint(uint256)"(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    redeem(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "redeem(uint256)"(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supplyRatePerBlock(overrides?: CallOverrides): Promise<[BigNumber]>;

    "supplyRatePerBlock()"(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  exchangeRateCurrent(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "exchangeRateCurrent()"(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;

  "exchangeRateStored()"(overrides?: CallOverrides): Promise<BigNumber>;

  mint(
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "mint(uint256)"(
    _mintAmount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  redeem(
    _redeemTokens: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "redeem(uint256)"(
    _redeemTokens: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supplyRatePerBlock(overrides?: CallOverrides): Promise<BigNumber>;

  "supplyRatePerBlock()"(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    exchangeRateCurrent(overrides?: CallOverrides): Promise<BigNumber>;

    "exchangeRateCurrent()"(overrides?: CallOverrides): Promise<BigNumber>;

    exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;

    "exchangeRateStored()"(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "mint(uint256)"(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    redeem(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "redeem(uint256)"(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supplyRatePerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    "supplyRatePerBlock()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    exchangeRateCurrent(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "exchangeRateCurrent()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    exchangeRateStored(overrides?: CallOverrides): Promise<BigNumber>;

    "exchangeRateStored()"(overrides?: CallOverrides): Promise<BigNumber>;

    mint(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "mint(uint256)"(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    redeem(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "redeem(uint256)"(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supplyRatePerBlock(overrides?: CallOverrides): Promise<BigNumber>;

    "supplyRatePerBlock()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    exchangeRateCurrent(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "exchangeRateCurrent()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    exchangeRateStored(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "exchangeRateStored()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    mint(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "mint(uint256)"(
      _mintAmount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    redeem(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "redeem(uint256)"(
      _redeemTokens: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supplyRatePerBlock(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "supplyRatePerBlock()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}