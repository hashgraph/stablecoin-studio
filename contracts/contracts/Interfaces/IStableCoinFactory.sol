// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenManager} from './IHederaTokenManager.sol';
import {KeysLib} from '../library/KeysLib.sol';

interface IStableCoinFactory {
    event Deployed(DeployedStableCoin);

    event StableCoinFactoryInitialized();

    event HederaTokenManagerAddressEdited(
        address indexed oldAddress,
        address indexed newAddress
    );

    event HederaTokenManagerAddressRemoved(
        uint256 index,
        address indexed addressRemoved
    );

    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    event HederaTokenManagerAddressAdded(address indexed newHederaTokenManager);

    struct TokenStruct {
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        int64 tokenMaxSupply;
        int64 tokenInitialSupply;
        int32 tokenDecimals;
        address reserveAddress;
        int256 reserveInitialAmount;
        bool createReserve;
        KeysLib.KeysStruct[] keys;
        IHederaTokenManager.RolesStruct[] roles;
        IHederaTokenManager.CashinRoleStruct cashinRole;
    }

    struct DeployedStableCoin {
        address stableCoinProxy;
        address stableCoinProxyAdmin;
        address stableCoinContractAddress;
        address tokenAddress;
        address reserveProxy;
        address reserveProxyAdmin;
    }

    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    ) external payable returns (DeployedStableCoin memory);

    function getHederaTokenManagerAddress()
        external
        view
        returns (address[] memory);

    function addHederaTokenManagerVersion(address newAddress) external;

    function editHederaTokenManagerAddress(
        uint256 index,
        address newAddress
    ) external;

    function changeAdmin(address newAddress) external;

    function removeHederaTokenManagerAddress(uint256 index) external;

    function getAdmin() external view returns (address);
}
