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
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .deleteToken(currentTokenAddress);

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
