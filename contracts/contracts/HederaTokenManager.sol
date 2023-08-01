// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    IERC20Upgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {
    IERC20MetadataUpgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import {IHederaTokenManager} from './Interfaces/IHederaTokenManager.sol';
import {CashIn} from './extensions/CashIn.sol';
import {Burnable} from './extensions/Burnable.sol';
import {Wipeable} from './extensions/Wipeable.sol';
import {Pausable} from './extensions/Pausable.sol';
import {Freezable} from './extensions/Freezable.sol';
import {Rescatable} from './extensions/Rescatable.sol';
import {Deletable} from './extensions/Deletable.sol';
import {Reserve} from './extensions/Reserve.sol';

import {TokenOwner, IHederaTokenService} from './extensions/TokenOwner.sol';
import {KYC} from './extensions/KYC.sol';
import {RoleManagement} from './extensions/RoleManagement.sol';
import {KeysLib} from './library/KeysLib.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';

contract HederaTokenManager is
    IHederaTokenManager,
    CashIn,
    Burnable,
    Wipeable,
    Pausable,
    Freezable,
    Deletable,
    Rescatable,
    KYC,
    RoleManagement
{
    uint256 private constant _ADMIN_KEY_BIT = 0;
    uint256 private constant _SUPPLY_KEY_BIT = 4;

    /**
     * @dev Constructor required to avoid Initializer attack on logic contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the stable coin frmo the proxy
     *
     * @param init the underlying token to create
     *
     * @return createdTokenAddress the address of the created token
     */
    function initialize(
        InitializeStruct calldata init
    )
        external
        payable
        initializer
        addressIsNotZero(init.originalSender)
        returns (address)
    {
        __reserveInit(init.reserveAddress); // Initialize reserve
        __rolesInit();
        _grantInitialRoles(init.originalSender, init.roles, init.cashinRole);

        (int64 responseCode, address createdTokenAddress) = IHederaTokenService(
            _PRECOMPILED_ADDRESS
        ).createFungibleToken{value: msg.value}(
            init.token,
            init.initialTotalSupply,
            init.tokenDecimals
        );

        _checkResponse(responseCode);

        __tokenOwnerInit(createdTokenAddress);

        _transferFundsBackToOriginalSender(init.originalSender);

        return createdTokenAddress;
    }

    /**
     * @dev Returns the name of the token
     *
     * @return string The the name of the token
     */
    function name() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).name();
    }

    /**
     * @dev Returns the symbol of the token
     *
     * @return string The the symbol of the token
     */
    function symbol() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).symbol();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return uint8 The number of decimals of the token
     */
    function decimals() external view returns (uint8) {
        return _decimals();
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(
        address account
    ) external view override(IHederaTokenManager) returns (uint256) {
        return _balanceOf(account);
    }

    /**
     * @dev Update token
     *
     * @param updatedToken Values to update the token
     */
    function updateToken(
        UpdateTokenStruct calldata updatedToken
    )
        external
        override(IHederaTokenManager)
        onlyRole(_getRoleId(RoleName.ADMIN))
    {
        // Token Keys
        IHederaTokenService.TokenKey[]
            memory hederaKeys = new IHederaTokenService.TokenKey[](
                updatedToken.keys.length
            );

        for (uint256 i = 0; i < updatedToken.keys.length; i++) {
            // we avoid the admin key to be updated
            if (
                KeysLib.containsKey(
                    _ADMIN_KEY_BIT,
                    updatedToken.keys[i].keyType
                ) && updatedToken.keys[i].publicKey.length != 0
            ) {
                revert AdminKeyUpdateError();
            }

            // we avoid the supply key to be updated
            if (
                KeysLib.containsKey(
                    _SUPPLY_KEY_BIT,
                    updatedToken.keys[i].keyType
                ) && updatedToken.keys[i].publicKey.length != 0
            ) {
                revert SupplyKeyUpdateError();
            }

            hederaKeys[i] = IHederaTokenService.TokenKey({
                keyType: updatedToken.keys[i].keyType,
                key: KeysLib.generateKey(
                    updatedToken.keys[i].publicKey,
                    address(this),
                    updatedToken.keys[i].isED25519
                )
            });
        }

        IHederaTokenService.HederaToken memory hederaToken;

        address currentTokenAddress = _getTokenAddress();

        hederaToken = _updateHederaTokenInfo(
            updatedToken,
            hederaKeys,
            currentTokenAddress
        );

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .updateTokenInfo(currentTokenAddress, hederaToken);

        _checkResponse(responseCode);

        emit TokenUpdated(currentTokenAddress, updatedToken);
    }

    /**
     * @dev Grants initial roles to the SC creator
     *
     * @param originalSender address of the original sender
     * @param roles array of roles to grant
     * @param cashinRole cashin role to grant
     */
    function _grantInitialRoles(
        address originalSender,
        RolesStruct[] memory roles,
        CashinRoleStruct memory cashinRole
    ) private onlyInitializing {
        // granting all roles except cashin role
        for (uint256 i = 0; i < roles.length; i++) {
            _grantRole(roles[i].role, roles[i].account);
        }

        // granting cashin role
        if (cashinRole.account != address(0)) {
            if (cashinRole.allowance > 0)
                _grantSupplierRole(cashinRole.account, cashinRole.allowance);
            else _grantUnlimitedSupplierRole(cashinRole.account);
        }

        // granting admin role, always to the SC creator
        _setupRole(_getRoleId(RoleName.ADMIN), originalSender);
    }

    /**
     * @dev Transfers the remaining HBARs from msg.value back to the original sender
     *
     * @param originalSender address of the original sender
     */
    function _transferFundsBackToOriginalSender(
        address originalSender
    ) private onlyInitializing {
        uint256 currentBalance = address(this).balance;
        if (currentBalance == 0) return;
        (bool s, ) = originalSender.call{value: currentBalance}('');
        if (!s) revert RefundingError(currentBalance);
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function _balanceOf(
        address account
    ) internal view override(TokenOwner) returns (uint256) {
        return IERC20Upgradeable(_getTokenAddress()).balanceOf(account);
    }

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param to The address the tokens are transferred to
     */
    function _transfer(
        address to,
        int64 amount
    )
        internal
        override(TokenOwner)
        valueIsNotGreaterThan(
            uint256(SafeCast.toUint256(amount)),
            _balanceOf(address(this)),
            true
        )
    {
        if (to != address(this)) {
            address currentTokenAddress = _getTokenAddress();

            int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
                .transferToken(currentTokenAddress, address(this), to, amount);

            _checkResponse(responseCode);

            emit TokenTransfer(currentTokenAddress, address(this), to, amount);
        }
    }

    /**
     * @dev Update Hedera token info
     *
     * @param updatedToken Values to update the token
     * @param hederaKeys Hedera token keys
     * @param currentTokenAddress Current token address
     *
     * @return hederaTokenUpdated Hedera token info updated
     */
    function _updateHederaTokenInfo(
        UpdateTokenStruct calldata updatedToken,
        IHederaTokenService.TokenKey[] memory hederaKeys,
        address currentTokenAddress
    ) private returns (IHederaTokenService.HederaToken memory) {
        IHederaTokenService.Expiry memory expiry;
        if (updatedToken.second >= 0) expiry.second = updatedToken.second;
        if (updatedToken.autoRenewPeriod >= 0)
            expiry.autoRenewPeriod = updatedToken.autoRenewPeriod;

        IHederaTokenService.HederaToken memory hederaTokenInfo;
        if (bytes(updatedToken.tokenName).length > 0)
            hederaTokenInfo.name = updatedToken.tokenName;
        if (bytes(updatedToken.tokenSymbol).length > 0)
            hederaTokenInfo.symbol = updatedToken.tokenSymbol;
        hederaTokenInfo.tokenKeys = hederaKeys;
        hederaTokenInfo.memo = _getTokenInfo(currentTokenAddress);
        hederaTokenInfo.expiry = expiry;

        return hederaTokenInfo;
    }

    /**
     * @dev Is required because of an Hedera's bug, when keys are updated for a token, the memo gets removed.
     *
     * @param tokenAddress The address of the token
     *
     * @return string The memo of the token
     */
    function _getTokenInfo(
        address tokenAddress
    ) private returns (string memory) {
        (
            int64 responseCode,
            IHederaTokenService.TokenInfo memory info
        ) = IHederaTokenService(_PRECOMPILED_ADDRESS).getTokenInfo(
                tokenAddress
            );

        _checkResponse(responseCode);

        return info.token.memo;
    }
}
