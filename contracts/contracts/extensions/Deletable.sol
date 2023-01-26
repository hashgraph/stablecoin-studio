// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IDeletable.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract Deletable is IDeletable, TokenOwner, Roles {
    /**
     * @dev Deletes the token
     *
     */
    function deleteToken()
        external
        override(IDeletable)
        onlyRole(_getRoleId(RoleName.DELETE))
        returns (bool)
    {
        emit TokenDeleted(_getTokenAddress());

        int256 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .deleteToken(_getTokenAddress());

        bool success = _checkResponse(responseCode);

        return success;
    }
}
