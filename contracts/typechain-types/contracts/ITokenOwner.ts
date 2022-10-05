/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
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
} from "../common";

export interface ITokenOwnerInterface extends utils.Interface {
  functions: {
    "getTokenAddress()": FunctionFragment;
    "getTokenOwnerAddress()": FunctionFragment;
    "setTokenAddress(address,address)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "getTokenAddress"
      | "getTokenOwnerAddress"
      | "setTokenAddress"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenOwnerAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setTokenAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(
    functionFragment: "getTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenOwnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTokenAddress",
    data: BytesLike
  ): Result;

  events: {};
}

export interface ITokenOwner extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ITokenOwnerInterface;

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
    getTokenAddress(overrides?: CallOverrides): Promise<[string]>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<[string]>;

    setTokenAddress(
      htsTokenOwnerAddress: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  getTokenAddress(overrides?: CallOverrides): Promise<string>;

  getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

  setTokenAddress(
    htsTokenOwnerAddress: PromiseOrValue<string>,
    tokenAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getTokenAddress(overrides?: CallOverrides): Promise<string>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

    setTokenAddress(
      htsTokenOwnerAddress: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    getTokenAddress(overrides?: CallOverrides): Promise<BigNumber>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<BigNumber>;

    setTokenAddress(
      htsTokenOwnerAddress: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getTokenAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTokenOwnerAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setTokenAddress(
      htsTokenOwnerAddress: PromiseOrValue<string>,
      tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
