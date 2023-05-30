// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IRoles} from './Interfaces/IRoles.sol';

import {
    Initializable
} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

import {
    StringsUpgradeable
} from '@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol';

abstract contract Roles is IRoles, Initializable {
    struct MemberData {
        bool active;
        uint256 pos;
    }

    struct RoleData {
        mapping(address => MemberData) members;
        address[] accounts;
    }

    mapping(bytes32 => RoleData) private _roles;

    bytes32 public constant ADMIN_ROLE = 0x00;

    /**
     * @dev Role that allows to mint token
     *
     * keccak_256("CASHIN_ROLE")
     */
    bytes32 private constant _CASHIN_ROLE =
        0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c;

    /**
     * @dev Role that allows to burn token
     *
     * keccak_256("BURN_ROLE")
     */
    bytes32 private constant _BURN_ROLE =
        0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22;

    /**
     * @dev Role that allows to wipe token
     *
     * keccak_256("WIPE_ROLE")
     */
    bytes32 private constant _WIPE_ROLE =
        0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;

    /**
     * @dev Role that allows to rescue both tokens and hbar
     *
     * keccak256("RESCUE_ROLE");
     */
    bytes32 private constant _RESCUE_ROLE =
        0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;

    /**
     * @dev Role that allows to pause the token
     *
     * keccak256("PAUSE_ROLE");
     */
    bytes32 private constant _PAUSE_ROLE =
        0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d;

    /**
     * @dev Role that allows to pause the token
     *
     * keccak256("FREEZE_ROLE");
     */
    bytes32 private constant _FREEZE_ROLE =
        0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d;

    /**
     * @dev Role that allows to pause the token
     *
     * keccak256("DELETE_ROLE");
     */
    bytes32 private constant _DELETE_ROLE =
        0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2;

    /**
     * @dev Chain to include in array positions for roles don't available for an account
     *
     * keccak256("WITHOUT_ROLE");
     */
    bytes32 private constant _WITHOUT_ROLE =
        0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc;

    /**
     * @dev Role that allows to grant or revoke KYC to an account for the token
     *
     * keccak256("KYC_ROLE");
     */
    bytes32 private constant _KYC_ROLE =
        0xdb11624602202c396fa347735a55e345a3aeb3e60f8885e1a71f1bf8d5886db7;

    /**
     * @dev Array containing all roles
     *
     */
    bytes32[] private _listOfroles;

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
     * @dev Checks if the account has been granted a role
     *
     * @param role The role the check if was granted
     * @param account The account to check if it has the role granted
     */
    function hasRole(
        bytes32 role,
        address account
    ) external view returns (bool) {
        return _hasRole(role, account);
    }

    /**
     * @dev Gets the list of accounts that have been granted a role
     *
     * @param role The role that the accounts have to be granted
     */
    function getAccountsWithRole(
        bytes32 role
    ) external view returns (address[] memory) {
        return _roles[role].accounts;
    }

    /**
     * @dev Gets the number of accounts that have been granted a role
     *
     * @param role The role that the accounts have to be granted
     */
    function getNumberOfAccountsWithRole(
        bytes32 role
    ) external view returns (uint256) {
        return _roles[role].accounts.length;
    }

    /**
     * @dev Grants a role to an account
     *
     * Only the 'ADMIN ROLE` can execute
     * Emits a RoleGranted event
     *
     * @param role The role to be granted
     * @param account The account to wich the role is granted
     */
    function grantRole(
        bytes32 role,
        address account
    ) external onlyRole(ADMIN_ROLE) {
        _grantRole(role, account);
    }

    /**
     * @dev Revokes a role from an account
     *
     * Only the 'ADMIN ROLE` can execute
     * Emits a RoleRevoked event
     *
     * @param role The role to be revoked
     * @param account The account to wich the role is revoked
     */
    function revokeRole(
        bytes32 role,
        address account
    ) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
    }

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     */
    function getRoles(
        address account
    ) external view override(IRoles) returns (bytes32[] memory rolesToReturn) {
        uint256 rolesLength = _listOfroles.length;

        rolesToReturn = new bytes32[](rolesLength);

        for (uint i = 0; i < rolesLength; i++) {
            bytes32 role = _listOfroles[i];

            rolesToReturn[i] = _hasRole(role, account) ? role : _WITHOUT_ROLE;
        }
    }

    /**
     * @dev Returns a role bytes32 representation
     *
     * @param role The role we want to retrieve the bytes32 for
     */
    function getRoleId(
        RoleName role
    ) external view override(IRoles) returns (bytes32) {
        return _getRoleId(role);
    }

    /**
     * @dev Returns a role bytes32 representation
     *
     * @param role The role we want to retrieve the bytes32 for
     */
    function _getRoleId(RoleName role) internal view returns (bytes32) {
        return _listOfroles[uint256(role)];
    }

    /**
     * @dev Populates the array of existing roles
     *
     */
    function __rolesInit() internal onlyInitializing {
        _listOfroles.push(ADMIN_ROLE);
        _listOfroles.push(_CASHIN_ROLE);
        _listOfroles.push(_BURN_ROLE);
        _listOfroles.push(_WIPE_ROLE);
        _listOfroles.push(_RESCUE_ROLE);
        _listOfroles.push(_PAUSE_ROLE);
        _listOfroles.push(_FREEZE_ROLE);
        _listOfroles.push(_DELETE_ROLE);
        _listOfroles.push(_KYC_ROLE);
    }

    /**
     * @dev Checks if a role is granted to an account
     *
     * @param role The role to check if is granted
     * @param account The account for which the role is checked for
     */
    function _hasRole(
        bytes32 role,
        address account
    ) private view returns (bool) {
        return _roles[role].members[account].active;
    }

    /**
     * @dev Grants a role to an account
     *
     * @param role The role to be granted
     * @param account The account for which the role will be granted
     */
    function _grantRole(bytes32 role, address account) internal {
        if (_hasRole(role, account)) return;
        _roles[role].members[account] = MemberData(
            true,
            _roles[role].accounts.length
        );
        _roles[role].accounts.push(account);

        emit RoleGranted(role, account, msg.sender);
    }

    /**
     * @dev Revokes a role from an account
     *
     * @param role The role to be revoked
     * @param account The account for which the role will be revoked
     */
    function _revokeRole(bytes32 role, address account) internal {
        if (_hasRole(role, account)) {
            uint256 position = _roles[role].members[account].pos;
            uint256 lastIndex = _roles[role].accounts.length - 1;

            if (position < lastIndex) {
                address accountToMove = _roles[role].accounts[lastIndex];

                _roles[role].accounts[position] = accountToMove;

                _roles[role].members[accountToMove].pos = position;
            }

            _roles[role].accounts.pop();
            delete (_roles[role].members[account]);
            emit RoleRevoked(role, account, msg.sender);
        }
    }

    /**
     * @dev Checks if a role is granted to the calling account
     *
     * @param role The role to check if is granted
     */
    function _checkRole(bytes32 role) private view {
        _checkRole(role, msg.sender);
    }

    /**
     * @dev Checks if a role is granted to an account
     *
     * @param role The role to check if is granted
     * @param account The account for which the role is checked for
     */
    function _checkRole(bytes32 role, address account) private view {
        if (_hasRole(role, account)) return;
        revert AccountHasNoRole(account, role);
    }

    /**
     * @dev Grants a role to an account
     *
     * @param role The role to be granted
     * @param account The account for which the role will be granted
     */
    function _setupRole(bytes32 role, address account) internal virtual {
        _grantRole(role, account);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private __gap;
}
