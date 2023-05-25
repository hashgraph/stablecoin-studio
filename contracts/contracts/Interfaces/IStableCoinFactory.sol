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

    /**
     * @dev Emitted when the provided `addr` is 0
     *
     * @param addr The address to check
     */
    error AddressZero(address addr);

    /**
     * @dev Emitted when a function is called by the Factory non administrator account
     *
     * @param addr The account trying to execute the function
     */
    error OnlyAdministratorFunction(address addr);

    /**
     * @dev Emitted when the provided `value` is not less than `ref`
     *
     * @param value The value to check
     * @param ref The reference value
     */
    error LessThan(uint256 value, uint256 ref);

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
