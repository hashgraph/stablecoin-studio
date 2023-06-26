// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenManager} from './IHederaTokenManager.sol';
import {KeysLib} from '../library/KeysLib.sol';

interface IStableCoinFactory {
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
        string metadata;
    }

    struct DeployedStableCoin {
        address stableCoinProxy;
        address stableCoinProxyAdmin;
        address stableCoinContractAddress;
        address tokenAddress;
        address reserveProxy;
        address reserveProxyAdmin;
    }

    /**
     * @dev Emitted when a new stable coin is deployed
     *
     * @param deployedStableCoin The new deployed stable coin
     */
    event Deployed(DeployedStableCoin deployedStableCoin);

    /**
     * @dev Emitted when a stable coin factory is initialized
     *
     */
    event StableCoinFactoryInitialized();

    /**
     * @dev Emitted when the address of a HederaTokenManager contract is changed
     *
     * @param oldAddress The old HederaTokenManager contract address
     * @param newAddress The new HederaTokenManager contract address
     */
    event HederaTokenManagerAddressEdited(
        address indexed oldAddress,
        address indexed newAddress
    );

    /**
     * @dev Emitted when the address of a HederaTokenManager contract is removed
     *
     * @param index The index of the array for which the HederaTokenManager contract address to be removed
     * @param addressRemoved The HederaTokenManager contract address to be removed
     */
    event HederaTokenManagerAddressRemoved(
        uint256 index,
        address indexed addressRemoved
    );

    /**
     * @dev Emitted when the address of a HederaTokenManager contract is removed from the array
     *
     * @param oldAdmin The index of the array for which the HederaTokenManager contract address to be removed
     * @param newAdmin The HederaTokenManager contract address to be removed
     */
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);

    /**
     * @dev Emitted when the address of a HederaTokenManager contract is added to the array
     *
     * @param newHederaTokenManager The HederaTokenManager contract address to be added
     */
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

    /**
     * @dev Deploys a stable coin
     *
     * @param requestedToken The information provided to create the stable coin's token
     * @param stableCoinContractAddress The address of the HederaTokenManager contract to create the stable coin
     */
    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    ) external payable returns (DeployedStableCoin memory);

    /**
     * @dev Gets the HederaTokenManager contract address
     *
     */
    function getHederaTokenManagerAddress()
        external
        view
        returns (address[] memory);

    /**
     * @dev Adds a new stable coin to contract addresses
     *
     * @param newAddress The new address
     */
    function addHederaTokenManagerVersion(address newAddress) external;

    /**
     * @dev Edits a stable coin contract address
     *
     * @param index The index of the address
     * @param newAddress The new address
     */
    function editHederaTokenManagerAddress(
        uint256 index,
        address newAddress
    ) external;

    /**
     * @dev Changes the admin address
     *
     * @param newAddress The new address
     */
    function changeAdmin(address newAddress) external;

    /**
     * @dev Removes a stable coin contract address
     *
     * @param index The index of the address
     */
    function removeHederaTokenManagerAddress(uint256 index) external;

    /**
     * @dev Gets the admin address
     *
     * @return The admin address
     */
    function getAdmin() external view returns (address);
}
