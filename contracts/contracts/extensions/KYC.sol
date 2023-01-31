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
        address currentTokenAddress = _getTokenAddress();

        int256 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .grantTokenKyc(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit GrantTokenKyc(currentTokenAddress, account);

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
        address currentTokenAddress = _getTokenAddress();

        int256 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .revokeTokenKyc(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit RevokeTokenKyc(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
