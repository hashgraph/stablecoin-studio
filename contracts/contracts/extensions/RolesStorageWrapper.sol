// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IRoles} from './Interfaces/IRoles.sol';
// solhint-disable-next-line max-line-length
import {ADMIN_ROLE, _CASHIN_ROLE, _BURN_ROLE, _WIPE_ROLE, _RESCUE_ROLE, _PAUSE_ROLE, _FREEZE_ROLE, _DELETE_ROLE, _WITHOUT_ROLE, _KYC_ROLE, _CUSTOM_FEES_ROLE, _HOLD_CREATOR_ROLE} from '../constants/roles.sol';
import {_ROLES_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract RolesStorageWrapper {
    struct MemberData {
        bool active;
        uint256 pos;
    }

    struct RoleData {
        mapping(address => MemberData) members;
        address[] accounts;
    }

    struct RolesStorage {
        mapping(bytes32 => RoleData) roles;
        /**
         * @dev Array containing all roles
         *
         */
        bytes32[] listOfRoles;
    }

    // TODO: Better at interface
    /**
     * @dev Emitted when a role is granted to an account
     *
     * @param role The role to be granted
     * @param account The account for which the role is to be granted
     * @param sender The caller of the function that emitted the event
     */
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Emitted when a role is revoked from an account
     *
     * @param role The role to be revoked
     * @param account The account for which the role is to be revoked
     * @param sender The caller of the function that emitted the event
     */
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    /**
     * @dev Checks if a roles is granted for the calling account
     *
     * @param role The role to check if is granted for the calling account
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    /**
     * @dev Populates the array of existing roles
     *
     */
    function __rolesInit() internal {
        bytes32[] storage listOfRoles = _rolesStorage().listOfRoles;
        listOfRoles.push(ADMIN_ROLE);
        listOfRoles.push(_CASHIN_ROLE);
        listOfRoles.push(_BURN_ROLE);
        listOfRoles.push(_WIPE_ROLE);
        listOfRoles.push(_RESCUE_ROLE);
        listOfRoles.push(_PAUSE_ROLE);
        listOfRoles.push(_FREEZE_ROLE);
        listOfRoles.push(_DELETE_ROLE);
        listOfRoles.push(_KYC_ROLE);
        listOfRoles.push(_CUSTOM_FEES_ROLE);
        listOfRoles.push(_HOLD_CREATOR_ROLE);
    }

    /**
     * @dev Checks if a role is granted to an account
     *
     * @param role The role to check if is granted
     * @param account The account for which the role is checked for
     */
    function _hasRole(bytes32 role, address account) internal view returns (bool) {
        return _rolesStorage().roles[role].members[account].active;
    }

    /**
     * @dev Grants a role to an account
     *
     * @param role The role to be granted
     * @param account The account for which the role will be granted
     */
    function _grantRole(bytes32 role, address account) internal {
        if (_hasRole(role, account)) return;
        RolesStorage storage rolesStorage = _rolesStorage();
        rolesStorage.roles[role].members[account] = MemberData(true, rolesStorage.roles[role].accounts.length);
        rolesStorage.roles[role].accounts.push(account);

        emit RoleGranted(role, account, msg.sender);
    }

    /**
     * @dev Revokes a role from an account
     *
     * @param role The role to be revoked
     * @param account The account for which the role will be revoked
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (!_hasRole(role, account)) return;

        RolesStorage storage rolesStorage = _rolesStorage();
        uint256 position = rolesStorage.roles[role].members[account].pos;
        uint256 lastIndex = rolesStorage.roles[role].accounts.length - 1;

        if (position < lastIndex) {
            address accountToMove = rolesStorage.roles[role].accounts[lastIndex];

            rolesStorage.roles[role].accounts[position] = accountToMove;

            rolesStorage.roles[role].members[accountToMove].pos = position;
        }

        rolesStorage.roles[role].accounts.pop();
        delete (rolesStorage.roles[role].members[account]);
        emit RoleRevoked(role, account, msg.sender);
    }

    function _getAccountsWithRole(bytes32 role) internal view returns (address[] memory) {
        return _rolesStorage().roles[role].accounts;
    }

    function _getNumberOfAccountsWithRole(bytes32 role) internal view returns (uint256) {
        return _rolesStorage().roles[role].accounts.length;
    }

    /**
     * @dev Returns a role bytes32 representation
     *
     * @param role The role we want to retrieve the bytes32 for
     */
    function _getRoleId(IRoles.RoleName role) internal view returns (bytes32) {
        return _rolesStorage().listOfRoles[uint256(role)];
    }

    function _getRoles(address account) internal view returns (bytes32[] memory rolesToReturn_) {
        bytes32[] storage listOfRoles = _rolesStorage().listOfRoles;
        uint256 rolesLength = listOfRoles.length;

        rolesToReturn_ = new bytes32[](rolesLength);

        for (uint256 index; index < rolesLength; index++) {
            bytes32 role = listOfRoles[index];

            rolesToReturn_[index] = _hasRole(role, account) ? role : _WITHOUT_ROLE;
        }
    }

    /**
     * @dev Checks if a role is granted to the calling account
     *
     * @param role The role to check if is granted
     */
    function _checkRole(bytes32 role) private view {
        if (_hasRole(role, msg.sender)) return;
        revert IRoles.AccountHasNoRole(msg.sender, role);
    }

    function _rolesStorage() private pure returns (RolesStorage storage rolesStorage_) {
        bytes32 position = _ROLES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            rolesStorage_.slot := position
        }
    }
}
