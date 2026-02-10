// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {IPausable} from './Interfaces/IPausable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {_PAUSABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {_PAUSE_ROLE} from '../constants/roles.sol';

contract PausableFacet is IPausable, IStaticFunctionSelectors, TokenOwnerStorageWrapper, RolesStorageWrapper {
    /**
     * @dev Pauses the token in order to prevent it from being involved in any kind of operation
     *
     */
    function pause() external override(IPausable) onlyRole(_PAUSE_ROLE) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).pauseToken(currentTokenAddress);

        bool success = _checkResponse(responseCode);

        emit TokenPaused(currentTokenAddress);

        return success;
    }

    /**
     * @dev Unpauses the token in order to allow it to be involved in any kind of operation
     *
     */
    function unpause() external override(IPausable) onlyRole(_PAUSE_ROLE) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).unpauseToken(currentTokenAddress);

        bool success = _checkResponse(responseCode);

        emit TokenUnpaused(currentTokenAddress);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PAUSABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.pause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unpause.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPausable).interfaceId;
    }
}
