// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IRoleManagement {
    /**
     * @dev Emitted when `length_1` is not equal to `length_2`
     *
     * @param lengthArray1 The length of the first array
     * @param lengthArray2 The length of the second array
     */
    error ArraysLengthNotEqual(uint256 lengthArray1, uint256 lengthArray2);

    /**
     * @dev Grant the provided "roles" to all the "accounts", if CASHIN then "amounts" are the allowances
     *
     * @param roles The list of roles to grant
     * @param accounts The list of accounts to grant the roles to
     * @param amounts The list of allowances for the accounts in case the "cashin" role must be provided
     */
    function grantRoles(
        bytes32[] calldata roles,
        address[] calldata accounts,
        uint256[] calldata amounts
    ) external;

    /**
     * @dev Revoke the provided "roles" from all the "accounts"
     *
     * @param roles The list of roles to revoke
     * @param accounts The list of accounts to revoke the roles from
     */
    function revokeRoles(
        bytes32[] calldata roles,
        address[] calldata accounts
    ) external;
}
