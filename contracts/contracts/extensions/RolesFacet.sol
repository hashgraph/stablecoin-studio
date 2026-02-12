// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ADMIN_ROLE, _NUMBER_OF_ROLES} from '../constants/roles.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {_ROLES_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {Common} from '../core/Common.sol';

contract RolesFacet is IRoles, IStaticFunctionSelectors, Common, RolesStorageWrapper {
    /**
     * @dev Grants a role to an account
     *
     * Only the 'ADMIN ROLE` can execute
     * Emits a RoleGranted event
     *
     * @param role The role to be granted
     * @param account The account to wich the role is granted
     */
    function grantRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) addressIsNotZero(account) {
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
    function revokeRole(bytes32 role, address account) external onlyRole(ADMIN_ROLE) {
        _revokeRole(role, account);
    }

    /**
     * @dev Returns the full list of roles
     *
     */
    function getRolesList() external pure returns (bytes32[_NUMBER_OF_ROLES] memory rolesToReturn) {
        return _getRolesList();
    }

    /**
     * @dev Checks if the account has been granted a role
     *
     * @param role The role the check if was granted
     * @param account The account to check if it has the role granted
     */
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _hasRole(role, account);
    }

    /**
     * @dev Gets the list of accounts that have been granted a role
     *
     * @param role The role that the accounts have to be granted
     */
    function getAccountsWithRole(bytes32 role) external view returns (address[] memory) {
        return _getAccountsWithRole(role);
    }

    /**
     * @dev Gets the number of accounts that have been granted a role
     *
     * @param role The role that the accounts have to be granted
     */
    function getNumberOfAccountsWithRole(bytes32 role) external view returns (uint256) {
        return _getNumberOfAccountsWithRole(role);
    }

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     */
    function getRoles(address account) external view override(IRoles) returns (bytes32[] memory rolesToReturn) {
        return _getRoles(account);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ROLES_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.hasRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAccountsWithRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getNumberOfAccountsWithRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoles.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRolesList.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IRoles).interfaceId;
    }
}
