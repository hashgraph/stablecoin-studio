// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IDeletable} from './Interfaces/IDeletable.sol';
import {_DELETABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract Deletable is IDeletable, TokenOwner, Roles {
    /**
     * @dev Deletes the token
     *
     */
    function deleteToken() external override(IDeletable) onlyRole(_getRoleId(RoleName.DELETE)) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).deleteToken(currentTokenAddress);

        bool success = _checkResponse(responseCode);

        emit TokenDeleted(currentTokenAddress);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DELETABLE_RESOLVER_KEY;
    }
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.deleteToken.selector;
    }
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDeletable).interfaceId;
    }
}
