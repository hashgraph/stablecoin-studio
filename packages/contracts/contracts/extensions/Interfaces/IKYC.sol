// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IKYC {
    /**
     * @dev Emitted when the KYC is granted to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    event GrantTokenKyc(address indexed token, address indexed account);

    /**
     * @dev Emitted when the KYC is revoked to an account for the token
     *
     * @param token Token address
     * @param account Token address
     */
    event RevokeTokenKyc(address indexed token, address indexed account);

    /**
     * @dev Grants KYC to account for the token
     *
     * @param account The account to which the KYC will be granted
     */
    function grantKyc(address account) external returns (bool);

    /**
     * @dev Revokes KYC to account for the token
     *
     * @param account The account to which the KYC will be revoked
     */
    function revokeKyc(address account) external returns (bool);
}
