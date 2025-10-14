// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IHederaTokenManager, RolesStruct} from './Interfaces/IHederaTokenManager.sol';
import {_HEDERA_TOKEN_MANAGER_RESOLVER_KEY} from './constants/resolverKeys.sol';
import {SupplierAdminStorageWrapper} from './extensions/SupplierAdminStorageWrapper.sol';
import {ReserveStorageWrapper} from './extensions/ReserveStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {KeysLib} from './library/KeysLib.sol';
// solhint-disable-next-line max-line-length
import {IERC20MetadataUpgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import {HederaTokenManagerStorageWrapper} from './HederaTokenManagerStorageWrapper.sol';
import {IStaticFunctionSelectors} from './resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {ADMIN_ROLE} from './constants/roles.sol';

contract HederaTokenManagerFacet is
    IStaticFunctionSelectors,
    IHederaTokenManager,
    HederaTokenManagerStorageWrapper,
    ReserveStorageWrapper,
    SupplierAdminStorageWrapper
{
    uint256 private constant _ADMIN_KEY_BIT = 0;
    uint256 private constant _SUPPLY_KEY_BIT = 4;

    /**
     * @dev Checks that an string is not longer than 100 characters
     *
     * @param str The string whose length is going to be checked
     */
    modifier lessThan100(string calldata str) {
        if (bytes(str).length > 100) revert MoreThan100Error(str);
        _;
    }

    /**
     * @dev Constructor required to avoid Initializer attack on logic contract
     */
    constructor() {
        _disableInitializers(_HEDERA_TOKEN_MANAGER_RESOLVER_KEY);
    }

    /**
     * @dev Initializes the stablecoin frmo the proxy
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
        initializer(_HEDERA_TOKEN_MANAGER_RESOLVER_KEY)
        addressIsNotZero(init.originalSender)
        lessThan100(init.tokenMetadataURI)
        returns (address)
    {
        _setMetadata(init.tokenMetadataURI);
        __reserveInit(init.reserveAddress); // Initialize reserve
        _grantInitialRoles(init.originalSender, init.roles, init.cashinRole);

        (int64 responseCode, address createdTokenAddress) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .createFungibleToken{value: msg.value}(init.token, init.initialTotalSupply, init.tokenDecimals);

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
    function balanceOf(address account) external view override(IHederaTokenManager) returns (uint256) {
        return _balanceOf(account);
    }

    /**
     * @dev Update token
     *
     * @param updatedToken Values to update the token
     */
    function updateToken(
        UpdateTokenStruct calldata updatedToken
    ) external override(IHederaTokenManager) lessThan100(updatedToken.tokenMetadataURI) onlyRole(ADMIN_ROLE) {
        _setMetadata(updatedToken.tokenMetadataURI);

        address currentTokenAddress = _getTokenAddress();

        IHederaTokenService.HederaToken memory hederaToken;

        // Token Keys
        IHederaTokenService.TokenKey[] memory hederaKeys = new IHederaTokenService.TokenKey[](updatedToken.keys.length);

        for (uint256 i = 0; i < updatedToken.keys.length; i++) {
            // we avoid the admin key to be updated
            if (
                KeysLib.containsKey(_ADMIN_KEY_BIT, updatedToken.keys[i].keyType) &&
                updatedToken.keys[i].publicKey.length != 0
            ) {
                revert AdminKeyUpdateError();
            }

            // we avoid the supply key to be updated
            if (
                KeysLib.containsKey(_SUPPLY_KEY_BIT, updatedToken.keys[i].keyType) &&
                updatedToken.keys[i].publicKey.length != 0
            ) {
                revert SupplyKeyUpdateError();
            }

            hederaKeys[i] = IHederaTokenService.TokenKey({
                keyType: updatedToken.keys[i].keyType,
                key: KeysLib.generateKey(updatedToken.keys[i].publicKey, address(this), updatedToken.keys[i].isEd25519)
            });
        }

        hederaToken = _updateHederaTokenInfo(updatedToken, hederaKeys, currentTokenAddress);

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).updateTokenInfo(
            currentTokenAddress,
            hederaToken
        );

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
    ) private {
        uint256 length = roles.length;
        // granting all roles except cashin role
        for (uint256 i; i < length; ) {
            _grantRole(roles[i].role, roles[i].account);
            unchecked {
                ++i;
            }
        }

        // granting cashin role
        if (cashinRole.account != address(0)) {
            if (cashinRole.allowance > 0) _grantSupplierRole(cashinRole.account, cashinRole.allowance);
            else _grantUnlimitedSupplierRole(cashinRole.account);
        }

        // granting admin role, always to the SC creator
        _grantRole(ADMIN_ROLE, originalSender);
    }

    /**
     * @dev Transfers the remaining HBARs from msg.value back to the original sender
     *
     * @param originalSender address of the original sender
     */
    function _transferFundsBackToOriginalSender(address originalSender) private {
        uint256 currentBalance = address(this).balance;
        if (currentBalance == 0) return;
        (bool s, ) = originalSender.call{value: currentBalance}('');
        if (!s) revert RefundingError(currentBalance);
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
        if (updatedToken.autoRenewPeriod >= 0) expiry.autoRenewPeriod = updatedToken.autoRenewPeriod;

        IHederaTokenService.HederaToken memory hederaTokenInfo;
        if (bytes(updatedToken.tokenName).length > 0) hederaTokenInfo.name = updatedToken.tokenName;
        if (bytes(updatedToken.tokenSymbol).length > 0) hederaTokenInfo.symbol = updatedToken.tokenSymbol;
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
    function _getTokenInfo(address tokenAddress) private returns (string memory) {
        (int64 responseCode, IHederaTokenService.TokenInfo memory info) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .getTokenInfo(tokenAddress);

        _checkResponse(responseCode);

        return info.token.memo;
    }

    /**
     * @dev Gets the metadata
     *
     */
    function getMetadata() external view returns (string memory) {
        return _hederaTokenManagerDataStorage().metadata;
    }

    /**
     * @dev Sets the metadata
     *
     * @param metadata The metadata to set
     */
    function _setMetadata(string calldata metadata) private {
        _hederaTokenManagerDataStorage().metadata = metadata;

        emit MetadataSet(msg.sender, metadata);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HEDERA_TOKEN_MANAGER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initialize.selector;
        staticFunctionSelectors_[selectorIndex++] = this.name.selector;
        staticFunctionSelectors_[selectorIndex++] = this.symbol.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decimals.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateToken.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMetadata.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHederaTokenManager).interfaceId;
    }

    receive() external payable {}
}
