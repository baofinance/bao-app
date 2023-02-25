/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
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

export interface UnioracleInterface extends utils.Interface {
  functions: {
    "update()": FunctionFragment;
    "blockTimestampLast()": FunctionFragment;
    "consult(address,uint256)": FunctionFragment;
    "PERIOD()": FunctionFragment;
    "price0Average()": FunctionFragment;
    "price0CumulativeLast()": FunctionFragment;
    "price1Average()": FunctionFragment;
    "price1CumulativeLast()": FunctionFragment;
    "token0()": FunctionFragment;
    "token1()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "update"
      | "update()"
      | "blockTimestampLast"
      | "blockTimestampLast()"
      | "consult"
      | "consult(address,uint256)"
      | "PERIOD"
      | "PERIOD()"
      | "price0Average"
      | "price0Average()"
      | "price0CumulativeLast"
      | "price0CumulativeLast()"
      | "price1Average"
      | "price1Average()"
      | "price1CumulativeLast"
      | "price1CumulativeLast()"
      | "token0"
      | "token0()"
      | "token1"
      | "token1()"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "update", values?: undefined): string;
  encodeFunctionData(functionFragment: "update()", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "blockTimestampLast",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "blockTimestampLast()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "consult",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "consult(address,uint256)",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(functionFragment: "PERIOD", values?: undefined): string;
  encodeFunctionData(functionFragment: "PERIOD()", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "price0Average",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price0Average()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price0CumulativeLast",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price0CumulativeLast()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price1Average",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price1Average()",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price1CumulativeLast",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "price1CumulativeLast()",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "token0", values?: undefined): string;
  encodeFunctionData(functionFragment: "token0()", values?: undefined): string;
  encodeFunctionData(functionFragment: "token1", values?: undefined): string;
  encodeFunctionData(functionFragment: "token1()", values?: undefined): string;

  decodeFunctionResult(functionFragment: "update", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "update()", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "blockTimestampLast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blockTimestampLast()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "consult", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "consult(address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "PERIOD", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "PERIOD()", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "price0Average",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price0Average()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price0CumulativeLast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price0CumulativeLast()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price1Average",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price1Average()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price1CumulativeLast",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "price1CumulativeLast()",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "token0", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token0()", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "token1()", data: BytesLike): Result;

  events: {};
}

export interface Unioracle extends BaseContract {
  contractName: "Unioracle";

  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: UnioracleInterface;

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
    update(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "update()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    blockTimestampLast(overrides?: CallOverrides): Promise<[number]>;

    "blockTimestampLast()"(overrides?: CallOverrides): Promise<[number]>;

    consult(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amountOut: BigNumber }>;

    "consult(address,uint256)"(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { amountOut: BigNumber }>;

    PERIOD(overrides?: CallOverrides): Promise<[BigNumber]>;

    "PERIOD()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    price0Average(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _x: BigNumber }>;

    "price0Average()"(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _x: BigNumber }>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<[BigNumber]>;

    "price0CumulativeLast()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    price1Average(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _x: BigNumber }>;

    "price1Average()"(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { _x: BigNumber }>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<[BigNumber]>;

    "price1CumulativeLast()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    token0(overrides?: CallOverrides): Promise<[string]>;

    "token0()"(overrides?: CallOverrides): Promise<[string]>;

    token1(overrides?: CallOverrides): Promise<[string]>;

    "token1()"(overrides?: CallOverrides): Promise<[string]>;
  };

  update(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "update()"(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  blockTimestampLast(overrides?: CallOverrides): Promise<number>;

  "blockTimestampLast()"(overrides?: CallOverrides): Promise<number>;

  consult(
    token: PromiseOrValue<string>,
    amountIn: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "consult(address,uint256)"(
    token: PromiseOrValue<string>,
    amountIn: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  PERIOD(overrides?: CallOverrides): Promise<BigNumber>;

  "PERIOD()"(overrides?: CallOverrides): Promise<BigNumber>;

  price0Average(overrides?: CallOverrides): Promise<BigNumber>;

  "price0Average()"(overrides?: CallOverrides): Promise<BigNumber>;

  price0CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

  "price0CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

  price1Average(overrides?: CallOverrides): Promise<BigNumber>;

  "price1Average()"(overrides?: CallOverrides): Promise<BigNumber>;

  price1CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

  "price1CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

  token0(overrides?: CallOverrides): Promise<string>;

  "token0()"(overrides?: CallOverrides): Promise<string>;

  token1(overrides?: CallOverrides): Promise<string>;

  "token1()"(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    update(overrides?: CallOverrides): Promise<void>;

    "update()"(overrides?: CallOverrides): Promise<void>;

    blockTimestampLast(overrides?: CallOverrides): Promise<number>;

    "blockTimestampLast()"(overrides?: CallOverrides): Promise<number>;

    consult(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "consult(address,uint256)"(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    PERIOD(overrides?: CallOverrides): Promise<BigNumber>;

    "PERIOD()"(overrides?: CallOverrides): Promise<BigNumber>;

    price0Average(overrides?: CallOverrides): Promise<BigNumber>;

    "price0Average()"(overrides?: CallOverrides): Promise<BigNumber>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

    "price0CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

    price1Average(overrides?: CallOverrides): Promise<BigNumber>;

    "price1Average()"(overrides?: CallOverrides): Promise<BigNumber>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

    "price1CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

    token0(overrides?: CallOverrides): Promise<string>;

    "token0()"(overrides?: CallOverrides): Promise<string>;

    token1(overrides?: CallOverrides): Promise<string>;

    "token1()"(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    update(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "update()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    blockTimestampLast(overrides?: CallOverrides): Promise<BigNumber>;

    "blockTimestampLast()"(overrides?: CallOverrides): Promise<BigNumber>;

    consult(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "consult(address,uint256)"(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    PERIOD(overrides?: CallOverrides): Promise<BigNumber>;

    "PERIOD()"(overrides?: CallOverrides): Promise<BigNumber>;

    price0Average(overrides?: CallOverrides): Promise<BigNumber>;

    "price0Average()"(overrides?: CallOverrides): Promise<BigNumber>;

    price0CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

    "price0CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

    price1Average(overrides?: CallOverrides): Promise<BigNumber>;

    "price1Average()"(overrides?: CallOverrides): Promise<BigNumber>;

    price1CumulativeLast(overrides?: CallOverrides): Promise<BigNumber>;

    "price1CumulativeLast()"(overrides?: CallOverrides): Promise<BigNumber>;

    token0(overrides?: CallOverrides): Promise<BigNumber>;

    "token0()"(overrides?: CallOverrides): Promise<BigNumber>;

    token1(overrides?: CallOverrides): Promise<BigNumber>;

    "token1()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    update(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "update()"(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    blockTimestampLast(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "blockTimestampLast()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    consult(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "consult(address,uint256)"(
      token: PromiseOrValue<string>,
      amountIn: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PERIOD(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "PERIOD()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    price0Average(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "price0Average()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    price0CumulativeLast(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "price0CumulativeLast()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    price1Average(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "price1Average()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    price1CumulativeLast(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "price1CumulativeLast()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    token0(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token0()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    token1(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "token1()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
