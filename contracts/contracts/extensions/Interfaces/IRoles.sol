// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IRoles {
    enum RoleName {
        ADMIN,
        CASHIN,
        BURN,
        WIPE,
        RESCUE,
        PAUSE,
        FREEZE,
        DELETE,
        KYC,
        DEFAULT_ADMIN_ROLE
    }

    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    /**
     * @dev Emitted when the provided account is not granted the role
     *
     * @param account The account for which the role is checked for granted
     * @param role The role that is checked to see if the account has been granted
     *
     */
    error AccountHasNoRole(address account, bytes32 role);

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     * @return bytes32[] The array containing the roles
     */
    function getRoles(address account) external view returns (bytes32[] memory);

    /**
     * @dev Returns a role bytes32 representation
     *
     * @param role The role we want to retrieve the bytes32 for
     * @return bytes32 The bytes32 of the role
     */
    function getRoleId(RoleName role) external view returns (bytes32);
}
