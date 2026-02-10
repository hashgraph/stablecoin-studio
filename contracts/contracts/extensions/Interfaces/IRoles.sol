// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRoles {
    /**
     * @dev Emitted when the provided account is not granted the role
     *
     * @param account The account for which the role is checked for granted
     * @param role The role that is checked to see if the account has been granted
     *
     */
    error AccountHasNoRole(address account, bytes32 role);

    /**
     * @dev Emitted when trying to remove a role from the role list passing an out of bound position
     *
     * @param length The roles list length
     * @param position The 0 based index we are trying to access in the role list
     *
     */
    error RolePositionOutOfBounds(uint256 length, uint256 position);

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     * @return bytes32[] The array containing the roles
     */
    function getRoles(address account) external view returns (bytes32[] memory);
}
