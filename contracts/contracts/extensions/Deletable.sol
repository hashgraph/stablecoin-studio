// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IDeletable} from './Interfaces/IDeletable.sol';

abstract contract Deletable is IDeletable, TokenOwner, Roles {
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

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
