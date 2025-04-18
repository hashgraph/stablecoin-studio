// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';
import {IPausable} from './Interfaces/IPausable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';

abstract contract Pausable is IPausable, TokenOwner, Roles {
    /**
     * @dev Pauses the token in order to prevent it from being involved in any kind of operation
     *
     */
    function pause() external override(IPausable) onlyRole(_getRoleId(RoleName.PAUSE)) returns (bool) {
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
    function unpause() external override(IPausable) onlyRole(_getRoleId(RoleName.PAUSE)) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).unpauseToken(currentTokenAddress);

        bool success = _checkResponse(responseCode);

        emit TokenUnpaused(currentTokenAddress);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
