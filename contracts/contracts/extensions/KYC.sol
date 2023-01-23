// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IKYC.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract KYC is IKYC, TokenOwner, Roles {
    /**
     * @dev Grant KYC to account for the token
     *
     */
    function grantKyc(
        address account
    )
        external
        override(IKYC)
        onlyRole(_getRoleId(RoleName.KYC))
        returns (bool)
    {
        emit grantTokenKyc(_getTokenAddress(), account);

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS)
            .grantTokenKyc(_getTokenAddress(), account);

        bool success = _checkResponse(responseCode);

        return success;
    }

    /**
     * @dev Revoke KYC to account for the token
     *
     */
    function revokeKyc(
        address account
    )
        external
        override(IKYC)
        onlyRole(_getRoleId(RoleName.KYC))
        returns (bool)
    {
        emit revokeTokenKyc(_getTokenAddress(), account);

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS)
            .revokeTokenKyc(_getTokenAddress(), account);

        bool success = _checkResponse(responseCode);

        return success;
    }
}
