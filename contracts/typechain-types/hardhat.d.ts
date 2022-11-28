/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "AccessControlUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.AccessControlUpgradeable__factory>;
    getContractFactory(
      name: "IAccessControlUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IAccessControlUpgradeable__factory>;
    getContractFactory(
      name: "Initializable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Initializable__factory>;
    getContractFactory(
      name: "IERC20PermitUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20PermitUpgradeable__factory>;
    getContractFactory(
      name: "IERC20MetadataUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20MetadataUpgradeable__factory>;
    getContractFactory(
      name: "IERC20Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Upgradeable__factory>;
    getContractFactory(
      name: "ContextUpgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ContextUpgradeable__factory>;
    getContractFactory(
      name: "ERC165Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC165Upgradeable__factory>;
    getContractFactory(
      name: "IERC165Upgradeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165Upgradeable__factory>;
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "IERC1822Proxiable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1822Proxiable__factory>;
    getContractFactory(
      name: "IBeacon",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBeacon__factory>;
    getContractFactory(
      name: "ERC1967Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967Proxy__factory>;
    getContractFactory(
      name: "ERC1967Upgrade",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC1967Upgrade__factory>;
    getContractFactory(
      name: "Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Proxy__factory>;
    getContractFactory(
      name: "ProxyAdmin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ProxyAdmin__factory>;
    getContractFactory(
      name: "TransparentUpgradeableProxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TransparentUpgradeableProxy__factory>;
    getContractFactory(
      name: "Burnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Burnable__factory>;
    getContractFactory(
      name: "CashIn",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.CashIn__factory>;
    getContractFactory(
      name: "Deletable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Deletable__factory>;
    getContractFactory(
      name: "Freezable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Freezable__factory>;
    getContractFactory(
      name: "IBurnable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBurnable__factory>;
    getContractFactory(
      name: "ICashIn",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ICashIn__factory>;
    getContractFactory(
      name: "IDeletable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IDeletable__factory>;
    getContractFactory(
      name: "IFreezable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IFreezable__factory>;
    getContractFactory(
      name: "IPausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPausable__factory>;
    getContractFactory(
      name: "IRescatable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IRescatable__factory>;
    getContractFactory(
      name: "IRoles",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IRoles__factory>;
    getContractFactory(
      name: "ISupplierAdmin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ISupplierAdmin__factory>;
    getContractFactory(
      name: "ITokenOwner",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ITokenOwner__factory>;
    getContractFactory(
      name: "IWipeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWipeable__factory>;
    getContractFactory(
      name: "Pausable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Pausable__factory>;
    getContractFactory(
      name: "Rescatable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Rescatable__factory>;
    getContractFactory(
      name: "Roles",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Roles__factory>;
    getContractFactory(
      name: "SupplierAdmin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SupplierAdmin__factory>;
    getContractFactory(
      name: "TokenOwner",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TokenOwner__factory>;
    getContractFactory(
      name: "Wipeable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Wipeable__factory>;
    getContractFactory(
      name: "HederaERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HederaERC20__factory>;
    getContractFactory(
      name: "HederaERC20Proxy",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HederaERC20Proxy__factory>;
    getContractFactory(
      name: "HederaERC20ProxyAdmin",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.HederaERC20ProxyAdmin__factory>;
    getContractFactory(
      name: "IHederaTokenService",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IHederaTokenService__factory>;
    getContractFactory(
      name: "IHederaERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IHederaERC20__factory>;
    getContractFactory(
      name: "IStableCoinFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IStableCoinFactory__factory>;
    getContractFactory(
      name: "StableCoinFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.StableCoinFactory__factory>;
    getContractFactory(
      name: "StableCoinFactoryWrapper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.StableCoinFactoryWrapper__factory>;

    getContractAt(
      name: "AccessControlUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.AccessControlUpgradeable>;
    getContractAt(
      name: "IAccessControlUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IAccessControlUpgradeable>;
    getContractAt(
      name: "Initializable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Initializable>;
    getContractAt(
      name: "IERC20PermitUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20PermitUpgradeable>;
    getContractAt(
      name: "IERC20MetadataUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20MetadataUpgradeable>;
    getContractAt(
      name: "IERC20Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Upgradeable>;
    getContractAt(
      name: "ContextUpgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ContextUpgradeable>;
    getContractAt(
      name: "ERC165Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC165Upgradeable>;
    getContractAt(
      name: "IERC165Upgradeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165Upgradeable>;
    getContractAt(
      name: "Ownable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "IERC1822Proxiable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1822Proxiable>;
    getContractAt(
      name: "IBeacon",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBeacon>;
    getContractAt(
      name: "ERC1967Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967Proxy>;
    getContractAt(
      name: "ERC1967Upgrade",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC1967Upgrade>;
    getContractAt(
      name: "Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Proxy>;
    getContractAt(
      name: "ProxyAdmin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ProxyAdmin>;
    getContractAt(
      name: "TransparentUpgradeableProxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TransparentUpgradeableProxy>;
    getContractAt(
      name: "Burnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Burnable>;
    getContractAt(
      name: "CashIn",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.CashIn>;
    getContractAt(
      name: "Deletable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Deletable>;
    getContractAt(
      name: "Freezable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Freezable>;
    getContractAt(
      name: "IBurnable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBurnable>;
    getContractAt(
      name: "ICashIn",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ICashIn>;
    getContractAt(
      name: "IDeletable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IDeletable>;
    getContractAt(
      name: "IFreezable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IFreezable>;
    getContractAt(
      name: "IPausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPausable>;
    getContractAt(
      name: "IRescatable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IRescatable>;
    getContractAt(
      name: "IRoles",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IRoles>;
    getContractAt(
      name: "ISupplierAdmin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ISupplierAdmin>;
    getContractAt(
      name: "ITokenOwner",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ITokenOwner>;
    getContractAt(
      name: "IWipeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IWipeable>;
    getContractAt(
      name: "Pausable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Pausable>;
    getContractAt(
      name: "Rescatable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Rescatable>;
    getContractAt(
      name: "Roles",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Roles>;
    getContractAt(
      name: "SupplierAdmin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.SupplierAdmin>;
    getContractAt(
      name: "TokenOwner",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.TokenOwner>;
    getContractAt(
      name: "Wipeable",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.Wipeable>;
    getContractAt(
      name: "HederaERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.HederaERC20>;
    getContractAt(
      name: "HederaERC20Proxy",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.HederaERC20Proxy>;
    getContractAt(
      name: "HederaERC20ProxyAdmin",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.HederaERC20ProxyAdmin>;
    getContractAt(
      name: "IHederaTokenService",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IHederaTokenService>;
    getContractAt(
      name: "IHederaERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IHederaERC20>;
    getContractAt(
      name: "IStableCoinFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IStableCoinFactory>;
    getContractAt(
      name: "StableCoinFactory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.StableCoinFactory>;
    getContractAt(
      name: "StableCoinFactoryWrapper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.StableCoinFactoryWrapper>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
