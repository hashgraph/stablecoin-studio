// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ISupplierAdminStorageWrapper} from './Interfaces/ISupplierAdminStorageWrapper.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {_SUPPLIER_ADMIN_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {_CASHIN_ROLE} from '../constants/roles.sol';

abstract contract SupplierAdminStorageWrapper is
    ISupplierAdminStorageWrapper,
    TokenOwnerStorageWrapper,
    RolesStorageWrapper
{
    struct SupplierAdminStorage {
        mapping(address => uint256) supplierAllowances;
        mapping(address => bool) unlimitedSupplierAllowances;
    }

    function _getSupplierAllowance(address supplier) internal view returns (uint256) {
        return _supplierAdminStorage().supplierAllowances[supplier];
    }

    function _isUnlimitedSupplierAllowances(address supplier) internal view returns (bool) {
        return _supplierAdminStorage().unlimitedSupplierAllowances[supplier];
    }

    /**
     * @dev Validate that if the address account `supplier` isn't unlimited supplier's allowance,
     * and the `amount` not exceed the supplier allowance, subtracting the amount from supplier's allowance
     *
     * @param supplier The address of the supplier
     * @param amount The amount to check whether exceeds current supplier allowance
     */
    function _decreaseSupplierAllowance(address supplier, uint256 amount) internal {
        uint256 oldAllowance = _supplierAdminStorage().supplierAllowances[supplier];
        if (amount > oldAllowance) revert GreaterThan(amount, oldAllowance);

        uint256 newAllowance = oldAllowance - amount;
        _supplierAdminStorage().supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceDecreased(msg.sender, supplier, amount, oldAllowance, newAllowance);
    }

    /**
     * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited
     * supplier's allowance permission.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function _revokeSupplierRole(address supplier) internal {
        _supplierAdminStorage().supplierAllowances[supplier] = 0;
        _supplierAdminStorage().unlimitedSupplierAllowances[supplier] = false;
        _revokeRole(_CASHIN_ROLE, supplier);
    }

    /**
     * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance, sets unlimited
     * supplier's allowance permission, and sets the `amount` the supplier can mint to 0.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function _grantUnlimitedSupplierRole(address supplier) internal {
        _supplierAdminStorage().unlimitedSupplierAllowances[supplier] = true;
        _supplierAdminStorage().supplierAllowances[supplier] = 0;
        _grantRole(_CASHIN_ROLE, supplier);
    }

    /**
     * @dev  Gives `SUPPLIER ROLE' permissions to perform supplier's allowance and sets the `amount`
     * the supplier can mint, if you don't already have unlimited supplier's allowance permission.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     *
     */
    function _grantSupplierRole(address supplier, uint256 amount) internal {
        if (_supplierAdminStorage().unlimitedSupplierAllowances[supplier])
            revert AccountHasUnlimitedSupplierAllowance(supplier);
        _supplierAdminStorage().supplierAllowances[supplier] = amount;
        _grantRole(_CASHIN_ROLE, supplier);
    }

    function _supplierAdminStorage() internal pure returns (SupplierAdminStorage storage supplierAdminStorage_) {
        bytes32 position = _SUPPLIER_ADMIN_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            supplierAdminStorage_.slot := position
        }
    }
}
