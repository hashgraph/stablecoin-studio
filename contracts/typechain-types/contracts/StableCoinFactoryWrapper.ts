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
  PayableOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../common";

export declare namespace IStableCoinFactory {
  export type KeysStructStruct = {
    keyType: PromiseOrValue<BigNumberish>;
    PublicKey: PromiseOrValue<BytesLike>;
  };

  export type KeysStructStructOutput = [BigNumber, string] & {
    keyType: BigNumber;
    PublicKey: string;
  };

  export type TokenStructStruct = {
    tokenName: PromiseOrValue<string>;
    tokenSymbol: PromiseOrValue<string>;
    freeze: PromiseOrValue<boolean>;
    supplyType: PromiseOrValue<boolean>;
    tokenMaxSupply: PromiseOrValue<BigNumberish>;
    tokenInitialSupply: PromiseOrValue<BigNumberish>;
    tokenDecimals: PromiseOrValue<BigNumberish>;
    autoRenewAccountAddress: PromiseOrValue<string>;
    treasuryAddress: PromiseOrValue<string>;
    keys: IStableCoinFactory.KeysStructStruct[];
  };

  export type TokenStructStructOutput = [
    string,
    string,
    boolean,
    boolean,
    BigNumber,
    BigNumber,
    number,
    string,
    string,
    IStableCoinFactory.KeysStructStructOutput[]
  ] & {
    tokenName: string;
    tokenSymbol: string;
    freeze: boolean;
    supplyType: boolean;
    tokenMaxSupply: BigNumber;
    tokenInitialSupply: BigNumber;
    tokenDecimals: number;
    autoRenewAccountAddress: string;
    treasuryAddress: string;
    keys: IStableCoinFactory.KeysStructStructOutput[];
  };
}

export interface StableCoinFactoryWrapperInterface extends utils.Interface {
  functions: {
    "changeFactory(address)": FunctionFragment;
    "deployStableCoin((string,string,bool,bool,int64,uint64,uint32,address,address,(uint256,bytes)[]))": FunctionFragment;
    "getFactory()": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "changeFactory"
      | "deployStableCoin"
      | "getFactory"
      | "owner"
      | "renounceOwnership"
      | "transferOwnership"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "changeFactory",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "deployStableCoin",
    values: [IStableCoinFactory.TokenStructStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getFactory",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "changeFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deployStableCoin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getFactory", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
    "newFactoryAddress(address,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "newFactoryAddress"): EventFragment;
}

export interface OwnershipTransferredEventObject {
  previousOwner: string;
  newOwner: string;
}
export type OwnershipTransferredEvent = TypedEvent<
  [string, string],
  OwnershipTransferredEventObject
>;

export type OwnershipTransferredEventFilter =
  TypedEventFilter<OwnershipTransferredEvent>;

export interface newFactoryAddressEventObject {
  previousFactory: string;
  newFactory: string;
}
export type newFactoryAddressEvent = TypedEvent<
  [string, string],
  newFactoryAddressEventObject
>;

export type newFactoryAddressEventFilter =
  TypedEventFilter<newFactoryAddressEvent>;

export interface StableCoinFactoryWrapper extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: StableCoinFactoryWrapperInterface;

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
    changeFactory(
      newFactory: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getFactory(overrides?: CallOverrides): Promise<[string]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  changeFactory(
    newFactory: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  deployStableCoin(
    requestedToken: IStableCoinFactory.TokenStructStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getFactory(overrides?: CallOverrides): Promise<string>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    changeFactory(
      newFactory: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: CallOverrides
    ): Promise<[string, string, string, string]>;

    getFactory(overrides?: CallOverrides): Promise<string>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "OwnershipTransferred(address,address)"(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;
    OwnershipTransferred(
      previousOwner?: PromiseOrValue<string> | null,
      newOwner?: PromiseOrValue<string> | null
    ): OwnershipTransferredEventFilter;

    "newFactoryAddress(address,address)"(
      previousFactory?: PromiseOrValue<string> | null,
      newFactory?: PromiseOrValue<string> | null
    ): newFactoryAddressEventFilter;
    newFactoryAddress(
      previousFactory?: PromiseOrValue<string> | null,
      newFactory?: PromiseOrValue<string> | null
    ): newFactoryAddressEventFilter;
  };

  estimateGas: {
    changeFactory(
      newFactory: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getFactory(overrides?: CallOverrides): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    changeFactory(
      newFactory: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
