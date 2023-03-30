// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/IRoleManagement.sol';
import './SupplierAdmin.sol';

abstract contract RoleManagement is IRoleManagement, SupplierAdmin {
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
    ) external override(IRoleManagement) onlyRole(_getRoleId(RoleName.ADMIN)) {
        bytes32 cashInRole = _getRoleId(RoleName.CASHIN);

        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == cashInRole) {
                if (accounts.length != amounts.length)
                    revert ArraysLengthNotEqual(
                        accounts.length,
                        amounts.length
                    );
                for (uint256 j = 0; j < accounts.length; j++) {
                    if (amounts[j] != 0)
                        _grantSupplierRole(accounts[j], amounts[j]);
                    else _grantUnlimitedSupplierRole(accounts[j]);
                }
            } else {
                for (uint256 p = 0; p < accounts.length; p++) {
                    _grantRole(roles[i], accounts[p]);
                }
            }
        }
    }

    /**
     * @dev Revoke the provided "roles" from all the "accounts"
     *
     * @param roles The list of roles to revoke
     * @param accounts The list of accounts to revoke the roles from
     */
    function revokeRoles(
        bytes32[] calldata roles,
        address[] calldata accounts
    ) external override(IRoleManagement) onlyRole(_getRoleId(RoleName.ADMIN)) {
        bytes32 cashInRole = _getRoleId(RoleName.CASHIN);

        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == cashInRole) {
                for (uint256 j = 0; j < accounts.length; j++) {
                    _revokeSupplierRole(accounts[j]);
                }
            } else {
                for (uint256 p = 0; p < accounts.length; p++) {
                    _revokeRole(roles[i], accounts[p]);
                }
            }
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
