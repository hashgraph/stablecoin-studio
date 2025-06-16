// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ISupplierAdmin} from './Interfaces/ISupplierAdmin.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {SupplierAdminStorageWrapper} from './SupplierAdminStorageWrapper.sol';
import {_SUPPLIER_ADMIN_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract SupplierAdminFacet is ISupplierAdmin, IStaticFunctionSelectors, SupplierAdminStorageWrapper {
    /**
     * @dev Return number of tokens allowed to be minted of the address account `supplier`.
     *
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     *
     */
    function getSupplierAllowance(address supplier) external view override(ISupplierAdmin) returns (uint256) {
        return _getSupplierAllowance(supplier);
    }

    /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance.
     *
     * @param supplier The address of the supplier
     * @return True if is unlimited supplier's allowance
     *
     */
    function isUnlimitedSupplierAllowance(address supplier) external view override(ISupplierAdmin) returns (bool) {
        return _isUnlimitedSupplierAllowances(supplier);
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
    function grantSupplierRole(
        address supplier,
        uint256 amount
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(IRoles.RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        _grantSupplierRole(supplier, amount);
    }

    /**
     * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance, sets unlimited
     * supplier's allowance permission, and sets the `amount` the supplier can mint to 0.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function grantUnlimitedSupplierRole(
        address supplier
    ) external override(ISupplierAdmin) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) addressIsNotZero(supplier) {
        _grantUnlimitedSupplierRole(supplier);
    }

    /**
     * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited
     * supplier's allowance permission.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function revokeSupplierRole(
        address supplier
    ) external override(ISupplierAdmin) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) addressIsNotZero(supplier) {
        _revokeSupplierRole(supplier);
    }

    /**
     * @dev Reset a supplier's allowance to 0.
     * Emits a SupplierAllowanceReset event
     * Only the 'ADMIN SUPPLIER ROLE` can execute
     *
     * @param supplier The address of the supplier
     */
    function resetSupplierAllowance(
        address supplier
    ) external override(ISupplierAdmin) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) addressIsNotZero(supplier) {
        uint256 oldAllowance = _supplierAdminStorage().supplierAllowances[supplier];
        uint256 newAllowance = 0;
        _supplierAdminStorage().supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceReset(msg.sender, supplier, oldAllowance, newAllowance);
    }

    /**
     * @dev Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint.
     * Validate that the amount must be greater than zero.
     * Emits a SupplierAllowanceIncreased event.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     */
    function increaseSupplierAllowance(
        address supplier,
        uint256 amount
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(IRoles.RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        if (_supplierAdminStorage().unlimitedSupplierAllowances[supplier])
            revert AccountHasUnlimitedSupplierAllowance(supplier);
        uint256 oldAllowance = _supplierAdminStorage().supplierAllowances[supplier];
        uint256 newAllowance = oldAllowance + amount;
        _supplierAdminStorage().supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceIncreased(msg.sender, supplier, amount, oldAllowance, newAllowance);
    }

    /**
     * @dev Decreases the minting allowance of the `supplier`, reducing the `amount` that the supplier can mint.
     * Validate that the amount must be greater than zero, and the amount must not exceed the supplier allowance.
     * Emits a SupplierAllowanceDecreased event.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     * @param amount The amount to subtract from the supplier's current minting allowance
     */
    function decreaseSupplierAllowance(
        address supplier,
        uint256 amount
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(IRoles.RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        if (_supplierAdminStorage().unlimitedSupplierAllowances[supplier])
            revert AccountHasUnlimitedSupplierAllowance(supplier);
        _decreaseSupplierAllowance(supplier, amount);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SUPPLIER_ADMIN_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.getSupplierAllowance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isUnlimitedSupplierAllowance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.grantSupplierRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.grantUnlimitedSupplierRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeSupplierRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.resetSupplierAllowance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.increaseSupplierAllowance.selector;
        staticFunctionSelectors_[selectorIndex++] = this.decreaseSupplierAllowance.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ISupplierAdmin).interfaceId;
    }
}
