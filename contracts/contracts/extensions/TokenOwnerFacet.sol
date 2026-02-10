// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ITokenOwner} from './Interfaces/ITokenOwner.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {_TOKEN_OWNER_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract TokenOwnerFacet is ITokenOwner, IStaticFunctionSelectors, TokenOwnerStorageWrapper {
    /**
     * @dev Returns the token address
     *
     */
    function getTokenAddress() external view override returns (address) {
        return _getTokenAddress();
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TOKEN_OWNER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.getTokenAddress.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ITokenOwner).interfaceId;
    }
}
