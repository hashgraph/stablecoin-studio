// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IRoles} from './Interfaces/IRoles.sol';
// solhint-disable-next-line
import {
    AccessControlUpgradeable
} from '@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol';

abstract contract Roles is IRoles, AccessControlUpgradeable {
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

    function __rolesInit() internal onlyInitializing {
        __AccessControl_init();
        _listOfroles.push(DEFAULT_ADMIN_ROLE);
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
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     * @return rolesToReturn The array containing the roles
     */
    function getRoles(
        address account
    ) external view override(IRoles) returns (bytes32[] memory rolesToReturn) {
        uint256 rolesLength = _listOfroles.length;

        rolesToReturn = new bytes32[](rolesLength);

        for (uint i = 0; i < rolesLength; i++) {
            bytes32 role = _listOfroles[i];

            rolesToReturn[i] = hasRole(role, account) ? role : _WITHOUT_ROLE;
        }
    }

    /**
     * @dev Returns a role bytes32 representation
     *
     * @param role The role we want to retrieve the bytes32 for
     * @return bytes32 The bytes32 of the role
     */
    function getRoleId(
        RoleName role
    ) external view override(IRoles) returns (bytes32) {
        return _getRoleId(role);
    }

    function _getRoleId(RoleName role) internal view returns (bytes32) {
        return _listOfroles[uint256(role)];
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
