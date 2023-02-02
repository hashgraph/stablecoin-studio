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
        KYC
    }

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
