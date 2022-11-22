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

export declare namespace CompoundLens {
  export type CTokenBalancesStruct = {
    cToken: PromiseOrValue<string>;
    balanceOf: PromiseOrValue<BigNumberish>;
    borrowBalanceCurrent: PromiseOrValue<BigNumberish>;
    balanceOfUnderlying: PromiseOrValue<BigNumberish>;
    tokenBalance: PromiseOrValue<BigNumberish>;
    tokenAllowance: PromiseOrValue<BigNumberish>;
    collateralBalance: PromiseOrValue<BigNumberish>;
  };

  export type CTokenBalancesStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    cToken: string;
    balanceOf: BigNumber;
    borrowBalanceCurrent: BigNumber;
    balanceOfUnderlying: BigNumber;
    tokenBalance: BigNumber;
    tokenAllowance: BigNumber;
    collateralBalance: BigNumber;
  };

  export type CTokenMetadataStruct = {
    cToken: PromiseOrValue<string>;
    exchangeRateCurrent: PromiseOrValue<BigNumberish>;
    supplyRatePerBlock: PromiseOrValue<BigNumberish>;
    borrowRatePerBlock: PromiseOrValue<BigNumberish>;
    reserveFactorMantissa: PromiseOrValue<BigNumberish>;
    totalBorrows: PromiseOrValue<BigNumberish>;
    totalReserves: PromiseOrValue<BigNumberish>;
    totalSupply: PromiseOrValue<BigNumberish>;
    totalCash: PromiseOrValue<BigNumberish>;
    totalCollateralTokens: PromiseOrValue<BigNumberish>;
    isListed: PromiseOrValue<boolean>;
    collateralFactorMantissa: PromiseOrValue<BigNumberish>;
    underlyingAssetAddress: PromiseOrValue<string>;
    cTokenDecimals: PromiseOrValue<BigNumberish>;
    underlyingDecimals: PromiseOrValue<BigNumberish>;
    version: PromiseOrValue<BigNumberish>;
    collateralCap: PromiseOrValue<BigNumberish>;
  };

  export type CTokenMetadataStructOutput = [
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber,
    boolean,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    cToken: string;
    exchangeRateCurrent: BigNumber;
    supplyRatePerBlock: BigNumber;
    borrowRatePerBlock: BigNumber;
    reserveFactorMantissa: BigNumber;
    totalBorrows: BigNumber;
    totalReserves: BigNumber;
    totalSupply: BigNumber;
    totalCash: BigNumber;
    totalCollateralTokens: BigNumber;
    isListed: boolean;
    collateralFactorMantissa: BigNumber;
    underlyingAssetAddress: string;
    cTokenDecimals: BigNumber;
    underlyingDecimals: BigNumber;
    version: BigNumber;
    collateralCap: BigNumber;
  };

  export type CTokenUnderlyingPriceStruct = {
    cToken: PromiseOrValue<string>;
    underlyingPrice: PromiseOrValue<BigNumberish>;
  };

  export type CTokenUnderlyingPriceStructOutput = [string, BigNumber] & {
    cToken: string;
    underlyingPrice: BigNumber;
  };

  export type AccountLimitsStruct = {
    markets: PromiseOrValue<string>[];
    liquidity: PromiseOrValue<BigNumberish>;
    shortfall: PromiseOrValue<BigNumberish>;
  };

  export type AccountLimitsStructOutput = [string[], BigNumber, BigNumber] & {
    markets: string[];
    liquidity: BigNumber;
    shortfall: BigNumber;
  };
}

export interface LensInterface extends utils.Interface {
  functions: {
    "cTokenBalances(address,address)": FunctionFragment;
    "cTokenBalancesAll(address[],address)": FunctionFragment;
    "cTokenMetadata(address)": FunctionFragment;
    "cTokenMetadataAll(address[])": FunctionFragment;
    "cTokenUnderlyingPrice(address)": FunctionFragment;
    "cTokenUnderlyingPriceAll(address[])": FunctionFragment;
    "getAccountLimits(address,address)": FunctionFragment;
    "getClaimableCompRewards(address[],address,address)": FunctionFragment;
    "getClaimableSushiRewards(address[],address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "cTokenBalances"
      | "cTokenBalances(address,address)"
      | "cTokenBalancesAll"
      | "cTokenBalancesAll(address[],address)"
      | "cTokenMetadata"
      | "cTokenMetadata(address)"
      | "cTokenMetadataAll"
      | "cTokenMetadataAll(address[])"
      | "cTokenUnderlyingPrice"
      | "cTokenUnderlyingPrice(address)"
      | "cTokenUnderlyingPriceAll"
      | "cTokenUnderlyingPriceAll(address[])"
      | "getAccountLimits"
      | "getAccountLimits(address,address)"
      | "getClaimableCompRewards"
      | "getClaimableCompRewards(address[],address,address)"
      | "getClaimableSushiRewards"
      | "getClaimableSushiRewards(address[],address,address)"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "cTokenBalances",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenBalances(address,address)",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenBalancesAll",
    values: [PromiseOrValue<string>[], PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenBalancesAll(address[],address)",
    values: [PromiseOrValue<string>[], PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenMetadata",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenMetadata(address)",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenMetadataAll",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenMetadataAll(address[])",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenUnderlyingPrice",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenUnderlyingPrice(address)",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenUnderlyingPriceAll",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "cTokenUnderlyingPriceAll(address[])",
    values: [PromiseOrValue<string>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountLimits",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountLimits(address,address)",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimableCompRewards",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimableCompRewards(address[],address,address)",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimableSushiRewards",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getClaimableSushiRewards(address[],address,address)",
    values: [
      PromiseOrValue<string>[],
      PromiseOrValue<string>,
      PromiseOrValue<string>
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "cTokenBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenBalances(address,address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenBalancesAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenBalancesAll(address[],address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenMetadata",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenMetadata(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenMetadataAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenMetadataAll(address[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenUnderlyingPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenUnderlyingPrice(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenUnderlyingPriceAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "cTokenUnderlyingPriceAll(address[])",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountLimits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAccountLimits(address,address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimableCompRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimableCompRewards(address[],address,address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimableSushiRewards",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClaimableSushiRewards(address[],address,address)",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Lens extends BaseContract {
  contractName: "Lens";

  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: LensInterface;

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
    cTokenBalances(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenBalances(address,address)"(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cTokenBalancesAll(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenBalancesAll(address[],address)"(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cTokenMetadata(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenMetadata(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cTokenMetadataAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenMetadataAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cTokenUnderlyingPrice(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenUnderlyingPrice(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    cTokenUnderlyingPriceAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "cTokenUnderlyingPriceAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAccountLimits(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "getAccountLimits(address,address)"(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getClaimableCompRewards(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "getClaimableCompRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getClaimableSushiRewards(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    "getClaimableSushiRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  cTokenBalances(
    cToken: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenBalances(address,address)"(
    cToken: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cTokenBalancesAll(
    cTokens: PromiseOrValue<string>[],
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenBalancesAll(address[],address)"(
    cTokens: PromiseOrValue<string>[],
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cTokenMetadata(
    cToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenMetadata(address)"(
    cToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cTokenMetadataAll(
    cTokens: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenMetadataAll(address[])"(
    cTokens: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cTokenUnderlyingPrice(
    cToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenUnderlyingPrice(address)"(
    cToken: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  cTokenUnderlyingPriceAll(
    cTokens: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "cTokenUnderlyingPriceAll(address[])"(
    cTokens: PromiseOrValue<string>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAccountLimits(
    comptroller: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "getAccountLimits(address,address)"(
    comptroller: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getClaimableCompRewards(
    cTokens: PromiseOrValue<string>[],
    comp: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "getClaimableCompRewards(address[],address,address)"(
    cTokens: PromiseOrValue<string>[],
    comp: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getClaimableSushiRewards(
    cTokens: PromiseOrValue<string>[],
    sushi: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  "getClaimableSushiRewards(address[],address,address)"(
    cTokens: PromiseOrValue<string>[],
    sushi: PromiseOrValue<string>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    cTokenBalances(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenBalancesStructOutput>;

    "cTokenBalances(address,address)"(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenBalancesStructOutput>;

    cTokenBalancesAll(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenBalancesStructOutput[]>;

    "cTokenBalancesAll(address[],address)"(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenBalancesStructOutput[]>;

    cTokenMetadata(
      cToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenMetadataStructOutput>;

    "cTokenMetadata(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenMetadataStructOutput>;

    cTokenMetadataAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenMetadataStructOutput[]>;

    "cTokenMetadataAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenMetadataStructOutput[]>;

    cTokenUnderlyingPrice(
      cToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenUnderlyingPriceStructOutput>;

    "cTokenUnderlyingPrice(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenUnderlyingPriceStructOutput>;

    cTokenUnderlyingPriceAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenUnderlyingPriceStructOutput[]>;

    "cTokenUnderlyingPriceAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: CallOverrides
    ): Promise<CompoundLens.CTokenUnderlyingPriceStructOutput[]>;

    getAccountLimits(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.AccountLimitsStructOutput>;

    "getAccountLimits(address,address)"(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<CompoundLens.AccountLimitsStructOutput>;

    getClaimableCompRewards(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    "getClaimableCompRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    getClaimableSushiRewards(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;

    "getClaimableSushiRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber[]>;
  };

  filters: {};

  estimateGas: {
    cTokenBalances(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenBalances(address,address)"(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cTokenBalancesAll(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenBalancesAll(address[],address)"(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cTokenMetadata(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenMetadata(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cTokenMetadataAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenMetadataAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cTokenUnderlyingPrice(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenUnderlyingPrice(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    cTokenUnderlyingPriceAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "cTokenUnderlyingPriceAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getAccountLimits(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "getAccountLimits(address,address)"(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getClaimableCompRewards(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "getClaimableCompRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getClaimableSushiRewards(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    "getClaimableSushiRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    cTokenBalances(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenBalances(address,address)"(
      cToken: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cTokenBalancesAll(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenBalancesAll(address[],address)"(
      cTokens: PromiseOrValue<string>[],
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cTokenMetadata(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenMetadata(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cTokenMetadataAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenMetadataAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cTokenUnderlyingPrice(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenUnderlyingPrice(address)"(
      cToken: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    cTokenUnderlyingPriceAll(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "cTokenUnderlyingPriceAll(address[])"(
      cTokens: PromiseOrValue<string>[],
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getAccountLimits(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "getAccountLimits(address,address)"(
      comptroller: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getClaimableCompRewards(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "getClaimableCompRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      comp: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getClaimableSushiRewards(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    "getClaimableSushiRewards(address[],address,address)"(
      cTokens: PromiseOrValue<string>[],
      sushi: PromiseOrValue<string>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}