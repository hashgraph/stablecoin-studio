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
  PayableOverrides,
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
} from "../../common";

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
    number,
    BigNumber,
    BigNumber,
    string,
    string,
    IStableCoinFactory.KeysStructStructOutput[]
  ] & {
    tokenName: string;
    tokenSymbol: string;
    freeze: boolean;
    supplyType: boolean;
    tokenMaxSupply: number;
    tokenInitialSupply: BigNumber;
    tokenDecimals: BigNumber;
    autoRenewAccountAddress: string;
    treasuryAddress: string;
    keys: IStableCoinFactory.KeysStructStructOutput[];
  };
}

export interface IStableCoinFactoryInterface extends utils.Interface {
  functions: {
    "deployStableCoin((string,string,bool,bool,uint32,uint256,uint256,address,address,(uint256,bytes)[]))": FunctionFragment;
  };

  getFunction(nameOrSignatureOrTopic: "deployStableCoin"): FunctionFragment;

  encodeFunctionData(
    functionFragment: "deployStableCoin",
    values: [IStableCoinFactory.TokenStructStruct]
  ): string;

  decodeFunctionResult(
    functionFragment: "deployStableCoin",
    data: BytesLike
  ): Result;

  events: {};
}

export interface IStableCoinFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IStableCoinFactoryInterface;

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
    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;
  };

  deployStableCoin(
    requestedToken: IStableCoinFactory.TokenStructStruct,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: CallOverrides
    ): Promise<[string, string, string, string]>;
  };

  filters: {};

  estimateGas: {
    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    deployStableCoin(
      requestedToken: IStableCoinFactory.TokenStructStruct,
      overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
  };
}
