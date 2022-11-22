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

export interface SwapperInterface extends utils.Interface {
  functions: {
    "baoV1()": FunctionFragment;
    "baoV2()": FunctionFragment;
    "convertV1(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "baoV1"
      | "baoV1()"
      | "baoV2"
      | "baoV2()"
      | "convertV1"
      | "convertV1(address,uint256)"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "baoV1", values?: undefined): string;
  encodeFunctionData(functionFragment: "baoV1()", values?: undefined): string;
  encodeFunctionData(functionFragment: "baoV2", values?: undefined): string;
  encodeFunctionData(functionFragment: "baoV2()", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "convertV1",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "convertV1(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(functionFragment: "baoV1", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "baoV1()", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "baoV2", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "baoV2()", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "convertV1", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "convertV1(address,uint256)",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Swapper extends BaseContract {
  contractName: "Swapper";

  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SwapperInterface;

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
    baoV1(overrides?: CallOverrides): Promise<[string]>;

    "baoV1()"(overrides?: CallOverrides): Promise<[string]>;

    baoV2(overrides?: CallOverrides): Promise<[string]>;

    "baoV2()"(overrides?: CallOverrides): Promise<[string]>;

    convertV1(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "convertV1(address,uint256)"(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  baoV1(overrides?: CallOverrides): Promise<string>;

  "baoV1()"(overrides?: CallOverrides): Promise<string>;

  baoV2(overrides?: CallOverrides): Promise<string>;

  "baoV2()"(overrides?: CallOverrides): Promise<string>;

  convertV1(
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "convertV1(address,uint256)"(
    _to: PromiseOrValue<string>,
    _amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    baoV1(overrides?: CallOverrides): Promise<string>;

    "baoV1()"(overrides?: CallOverrides): Promise<string>;

    baoV2(overrides?: CallOverrides): Promise<string>;

    "baoV2()"(overrides?: CallOverrides): Promise<string>;

    convertV1(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    "convertV1(address,uint256)"(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    baoV1(overrides?: CallOverrides): Promise<BigNumber>;

    "baoV1()"(overrides?: CallOverrides): Promise<BigNumber>;

    baoV2(overrides?: CallOverrides): Promise<BigNumber>;

    "baoV2()"(overrides?: CallOverrides): Promise<BigNumber>;

    convertV1(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "convertV1(address,uint256)"(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    baoV1(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "baoV1()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    baoV2(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "baoV2()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    convertV1(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "convertV1(address,uint256)"(
      _to: PromiseOrValue<string>,
      _amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}