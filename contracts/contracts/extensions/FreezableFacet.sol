// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IFreezable} from './Interfaces/IFreezable.sol';
import {_FREEZABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract FreezableFacet is IFreezable, IStaticFunctionSelectors, TokenOwnerStorageWrapper, RolesStorageWrapper {
    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be freezed for the token
     */
    function freeze(
        address account
    ) external override(IFreezable) onlyRole(_getRoleId(IRoles.RoleName.FREEZE)) addressIsNotZero(account) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).freezeToken(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit TransfersFrozen(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be unfreezed for the token
     */
    function unfreeze(
        address account
    ) external override(IFreezable) onlyRole(_getRoleId(IRoles.RoleName.FREEZE)) addressIsNotZero(account) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).unfreezeToken(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit TransfersUnfrozen(currentTokenAddress, account);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.freeze.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unfreeze.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IFreezable).interfaceId;
    }
}
