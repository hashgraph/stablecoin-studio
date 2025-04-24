// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IRoles} from './Interfaces/IRoles.sol';
import {IRoleManagement} from './Interfaces/IRoleManagement.sol';
import {SupplierAdminStorageWrapper} from './SupplierAdminStorageWrapper.sol';
import {_ROLE_MANAGEMENT_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract RoleManagementFacet is IRoleManagement, IStaticFunctionSelectors, SupplierAdminStorageWrapper {
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
    ) external override(IRoleManagement) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) {
        bytes32 cashInRole = _getRoleId(IRoles.RoleName.CASHIN);

        for (uint256 i = 0; i < roles.length; i++) {
            if (roles[i] == cashInRole) {
                if (accounts.length != amounts.length) revert ArraysLengthNotEqual(accounts.length, amounts.length);
                for (uint256 j = 0; j < accounts.length; j++) {
                    if (amounts[j] != 0) _grantSupplierRole(accounts[j], amounts[j]);
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
    ) external override(IRoleManagement) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) {
        bytes32 cashInRole = _getRoleId(IRoles.RoleName.CASHIN);

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

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ROLE_MANAGEMENT_RESOLVER_KEY;
    }
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.grantRoles.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRoles.selector;
    }
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IRoleManagement).interfaceId;
    }
}
