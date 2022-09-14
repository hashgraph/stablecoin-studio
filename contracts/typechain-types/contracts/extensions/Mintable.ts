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
} from "../../common";

export interface MintableInterface extends utils.Interface {
  functions: {
    "ADMIN_SUPPLIER_ROLE()": FunctionFragment;
    "DEFAULT_ADMIN_ROLE()": FunctionFragment;
    "PAUSER_ROLE()": FunctionFragment;
    "RESCUE_ROLE()": FunctionFragment;
    "SUPPLIER_ROLE()": FunctionFragment;
    "WIPE_ROLE()": FunctionFragment;
    "controlAllowanceAmount(address,uint256)": FunctionFragment;
    "decreaseSupplierAllowance(address,uint256)": FunctionFragment;
    "getRoleAdmin(bytes32)": FunctionFragment;
    "getTokenAddress()": FunctionFragment;
    "getTokenOwnerAddress()": FunctionFragment;
    "grantRole(bytes32,address)": FunctionFragment;
    "grantSupplierRole(address,uint256)": FunctionFragment;
    "grantUnlimitedSupplierRole(address)": FunctionFragment;
    "hasRole(bytes32,address)": FunctionFragment;
    "increaseSupplierAllowance(address,uint256)": FunctionFragment;
    "isUnlimitedSupplierAllowance(address)": FunctionFragment;
    "mint(address,uint256)": FunctionFragment;
    "renounceRole(bytes32,address)": FunctionFragment;
    "resetSupplierAllowance(address)": FunctionFragment;
    "revokeRole(bytes32,address)": FunctionFragment;
    "revokeSupplierRole(address)": FunctionFragment;
    "setTokenAddress(address,address)": FunctionFragment;
    "supplierAllowance(address)": FunctionFragment;
    "supportsInterface(bytes4)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "ADMIN_SUPPLIER_ROLE"
      | "DEFAULT_ADMIN_ROLE"
      | "PAUSER_ROLE"
      | "RESCUE_ROLE"
      | "SUPPLIER_ROLE"
      | "WIPE_ROLE"
      | "controlAllowanceAmount"
      | "decreaseSupplierAllowance"
      | "getRoleAdmin"
      | "getTokenAddress"
      | "getTokenOwnerAddress"
      | "grantRole"
      | "grantSupplierRole"
      | "grantUnlimitedSupplierRole"
      | "hasRole"
      | "increaseSupplierAllowance"
      | "isUnlimitedSupplierAllowance"
      | "mint"
      | "renounceRole"
      | "resetSupplierAllowance"
      | "revokeRole"
      | "revokeSupplierRole"
      | "setTokenAddress"
      | "supplierAllowance"
      | "supportsInterface"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "ADMIN_SUPPLIER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "PAUSER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "RESCUE_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "SUPPLIER_ROLE",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "WIPE_ROLE", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "controlAllowanceAmount",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "decreaseSupplierAllowance",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoleAdmin",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenOwnerAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "grantRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "grantSupplierRole",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "grantUnlimitedSupplierRole",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "hasRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "increaseSupplierAllowance",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "isUnlimitedSupplierAllowance",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "mint",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "renounceRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "resetSupplierAllowance",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeRole",
    values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "revokeSupplierRole",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "setTokenAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "supplierAllowance",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [PromiseOrValue<BytesLike>]
  ): string;

  decodeFunctionResult(
    functionFragment: "ADMIN_SUPPLIER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "DEFAULT_ADMIN_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "PAUSER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "RESCUE_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "SUPPLIER_ROLE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "WIPE_ROLE", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "controlAllowanceAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "decreaseSupplierAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoleAdmin",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenOwnerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "grantRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "grantSupplierRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "grantUnlimitedSupplierRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "hasRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "increaseSupplierAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isUnlimitedSupplierAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "mint", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "resetSupplierAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "revokeRole", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "revokeSupplierRole",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supplierAllowance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;

  events: {
    "Initialized(uint8)": EventFragment;
    "RoleAdminChanged(bytes32,bytes32,bytes32)": EventFragment;
    "RoleGranted(bytes32,address,address)": EventFragment;
    "RoleRevoked(bytes32,address,address)": EventFragment;
    "SupplierAllowanceDecreased(address,address,uint256,uint256,uint256)": EventFragment;
    "SupplierAllowanceIncreased(address,address,uint256,uint256,uint256)": EventFragment;
    "SupplierAllowanceReset(address,address,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleAdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleGranted"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RoleRevoked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SupplierAllowanceDecreased"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SupplierAllowanceIncreased"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "SupplierAllowanceReset"): EventFragment;
}

export interface InitializedEventObject {
  version: number;
}
export type InitializedEvent = TypedEvent<[number], InitializedEventObject>;

export type InitializedEventFilter = TypedEventFilter<InitializedEvent>;

export interface RoleAdminChangedEventObject {
  role: string;
  previousAdminRole: string;
  newAdminRole: string;
}
export type RoleAdminChangedEvent = TypedEvent<
  [string, string, string],
  RoleAdminChangedEventObject
>;

export type RoleAdminChangedEventFilter =
  TypedEventFilter<RoleAdminChangedEvent>;

export interface RoleGrantedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleGrantedEvent = TypedEvent<
  [string, string, string],
  RoleGrantedEventObject
>;

export type RoleGrantedEventFilter = TypedEventFilter<RoleGrantedEvent>;

export interface RoleRevokedEventObject {
  role: string;
  account: string;
  sender: string;
}
export type RoleRevokedEvent = TypedEvent<
  [string, string, string],
  RoleRevokedEventObject
>;

export type RoleRevokedEventFilter = TypedEventFilter<RoleRevokedEvent>;

export interface SupplierAllowanceDecreasedEventObject {
  sender: string;
  supplier: string;
  amount: BigNumber;
  oldAllowance: BigNumber;
  newAllowance: BigNumber;
}
export type SupplierAllowanceDecreasedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber],
  SupplierAllowanceDecreasedEventObject
>;

export type SupplierAllowanceDecreasedEventFilter =
  TypedEventFilter<SupplierAllowanceDecreasedEvent>;

export interface SupplierAllowanceIncreasedEventObject {
  sender: string;
  supplier: string;
  amount: BigNumber;
  oldAllowance: BigNumber;
  newAllowance: BigNumber;
}
export type SupplierAllowanceIncreasedEvent = TypedEvent<
  [string, string, BigNumber, BigNumber, BigNumber],
  SupplierAllowanceIncreasedEventObject
>;

export type SupplierAllowanceIncreasedEventFilter =
  TypedEventFilter<SupplierAllowanceIncreasedEvent>;

export interface SupplierAllowanceResetEventObject {
  sender: string;
  supplier: string;
  oldAllowance: BigNumber;
  newAllowance: BigNumber;
}
export type SupplierAllowanceResetEvent = TypedEvent<
  [string, string, BigNumber, BigNumber],
  SupplierAllowanceResetEventObject
>;

export type SupplierAllowanceResetEventFilter =
  TypedEventFilter<SupplierAllowanceResetEvent>;

export interface Mintable extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MintableInterface;

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
    ADMIN_SUPPLIER_ROLE(overrides?: CallOverrides): Promise<[string]>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<[string]>;

    PAUSER_ROLE(overrides?: CallOverrides): Promise<[string]>;

    RESCUE_ROLE(overrides?: CallOverrides): Promise<[string]>;

    SUPPLIER_ROLE(overrides?: CallOverrides): Promise<[string]>;

    WIPE_ROLE(overrides?: CallOverrides): Promise<[string]>;

    controlAllowanceAmount(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    decreaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[string]>;

    getTokenAddress(overrides?: CallOverrides): Promise<[string]>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<[string]>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    grantSupplierRole(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    grantUnlimitedSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    increaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    isUnlimitedSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    mint(
      account: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    resetSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    revokeSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    supplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;
  };

  ADMIN_SUPPLIER_ROLE(overrides?: CallOverrides): Promise<string>;

  DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

  PAUSER_ROLE(overrides?: CallOverrides): Promise<string>;

  RESCUE_ROLE(overrides?: CallOverrides): Promise<string>;

  SUPPLIER_ROLE(overrides?: CallOverrides): Promise<string>;

  WIPE_ROLE(overrides?: CallOverrides): Promise<string>;

  controlAllowanceAmount(
    supplier: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  decreaseSupplierAllowance(
    supplier: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getRoleAdmin(
    role: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<string>;

  getTokenAddress(overrides?: CallOverrides): Promise<string>;

  getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

  grantRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  grantSupplierRole(
    supplier: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  grantUnlimitedSupplierRole(
    supplier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  hasRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  increaseSupplierAllowance(
    supplier: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  isUnlimitedSupplierAllowance(
    supplier: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  mint(
    account: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  renounceRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  resetSupplierAllowance(
    supplier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeRole(
    role: PromiseOrValue<BytesLike>,
    account: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  revokeSupplierRole(
    supplier: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  setTokenAddress(
    _htsTokenOwnerAddress: PromiseOrValue<string>,
    _tokenAddress: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  supplierAllowance(
    supplier: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  supportsInterface(
    interfaceId: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  callStatic: {
    ADMIN_SUPPLIER_ROLE(overrides?: CallOverrides): Promise<string>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<string>;

    PAUSER_ROLE(overrides?: CallOverrides): Promise<string>;

    RESCUE_ROLE(overrides?: CallOverrides): Promise<string>;

    SUPPLIER_ROLE(overrides?: CallOverrides): Promise<string>;

    WIPE_ROLE(overrides?: CallOverrides): Promise<string>;

    controlAllowanceAmount(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    decreaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    getTokenAddress(overrides?: CallOverrides): Promise<string>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<string>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    grantSupplierRole(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    grantUnlimitedSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    increaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<void>;

    isUnlimitedSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    mint(
      account: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    resetSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    revokeSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    supplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;
  };

  filters: {
    "Initialized(uint8)"(version?: null): InitializedEventFilter;
    Initialized(version?: null): InitializedEventFilter;

    "RoleAdminChanged(bytes32,bytes32,bytes32)"(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;
    RoleAdminChanged(
      role?: PromiseOrValue<BytesLike> | null,
      previousAdminRole?: PromiseOrValue<BytesLike> | null,
      newAdminRole?: PromiseOrValue<BytesLike> | null
    ): RoleAdminChangedEventFilter;

    "RoleGranted(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;
    RoleGranted(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleGrantedEventFilter;

    "RoleRevoked(bytes32,address,address)"(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;
    RoleRevoked(
      role?: PromiseOrValue<BytesLike> | null,
      account?: PromiseOrValue<string> | null,
      sender?: PromiseOrValue<string> | null
    ): RoleRevokedEventFilter;

    "SupplierAllowanceDecreased(address,address,uint256,uint256,uint256)"(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      amount?: null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceDecreasedEventFilter;
    SupplierAllowanceDecreased(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      amount?: null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceDecreasedEventFilter;

    "SupplierAllowanceIncreased(address,address,uint256,uint256,uint256)"(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      amount?: null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceIncreasedEventFilter;
    SupplierAllowanceIncreased(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      amount?: null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceIncreasedEventFilter;

    "SupplierAllowanceReset(address,address,uint256,uint256)"(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceResetEventFilter;
    SupplierAllowanceReset(
      sender?: PromiseOrValue<string> | null,
      supplier?: PromiseOrValue<string> | null,
      oldAllowance?: null,
      newAllowance?: null
    ): SupplierAllowanceResetEventFilter;
  };

  estimateGas: {
    ADMIN_SUPPLIER_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    DEFAULT_ADMIN_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    PAUSER_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    RESCUE_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    SUPPLIER_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    WIPE_ROLE(overrides?: CallOverrides): Promise<BigNumber>;

    controlAllowanceAmount(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    decreaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenAddress(overrides?: CallOverrides): Promise<BigNumber>;

    getTokenOwnerAddress(overrides?: CallOverrides): Promise<BigNumber>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    grantSupplierRole(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    grantUnlimitedSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    increaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    isUnlimitedSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    mint(
      account: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    resetSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    revokeSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    supplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    ADMIN_SUPPLIER_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    DEFAULT_ADMIN_ROLE(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    PAUSER_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    RESCUE_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    SUPPLIER_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    WIPE_ROLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    controlAllowanceAmount(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    decreaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getRoleAdmin(
      role: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getTokenOwnerAddress(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    grantRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    grantSupplierRole(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    grantUnlimitedSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    hasRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    increaseSupplierAllowance(
      supplier: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    isUnlimitedSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    mint(
      account: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    renounceRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    resetSupplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeRole(
      role: PromiseOrValue<BytesLike>,
      account: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    revokeSupplierRole(
      supplier: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    setTokenAddress(
      _htsTokenOwnerAddress: PromiseOrValue<string>,
      _tokenAddress: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    supplierAllowance(
      supplier: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    supportsInterface(
      interfaceId: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
