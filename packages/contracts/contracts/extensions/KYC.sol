// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import {IKYC} from './Interfaces/IKYC.sol';

abstract contract KYC is IKYC, TokenOwner, Roles {
    /**
     * @dev Grants KYC to account for the token
     *
     * @param account The account to which the KYC will be granted
     */
    function grantKyc(
        address account
    )
        external
        override(IKYC)
        onlyRole(_getRoleId(RoleName.KYC))
        addressIsNotZero(account)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .grantTokenKyc(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit GrantTokenKyc(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev Revokes KYC to account for the token
     *
     * @param account The account to which the KYC will be revoked
     */
    function revokeKyc(
        address account
    )
        external
        override(IKYC)
        onlyRole(_getRoleId(RoleName.KYC))
        addressIsNotZero(account)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
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
