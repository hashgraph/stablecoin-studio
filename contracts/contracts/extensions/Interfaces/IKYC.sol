// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IKYC {
    /**
     * @dev Emitted when the KYC is granted to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    event GrantTokenKyc(address token, address account);

    /**
     * @dev Emitted when the KYC is revoked to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    event RevokeTokenKyc(address token, address account);

    /**
     * @dev Grants KYC to an account for the token
     *
     */
    function grantKyc(address account) external returns (bool);

    /**
     * @dev Revokes KYC to an account for the token
     *
     */
    function revokeKyc(address account) external returns (bool);
}
