// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ISupplierAdmin} from './Interfaces/ISupplierAdmin.sol';
import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';

abstract contract SupplierAdmin is ISupplierAdmin, TokenOwner, Roles {
    mapping(address => uint256) private _supplierAllowances;
    mapping(address => bool) internal _unlimitedSupplierAllowances;

    /**
     * @dev Return number of tokens allowed to be minted of the address account `supplier`.
     *
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     *
     */
    function getSupplierAllowance(
        address supplier
    ) external view override(ISupplierAdmin) returns (uint256) {
        return _supplierAllowances[supplier];
    }

    /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance.
     *
     * @param supplier The address of the supplier
     * @return True if is unlimited supplier's allowance
     *
     */
    function isUnlimitedSupplierAllowance(
        address supplier
    ) external view override(ISupplierAdmin) returns (bool) {
        return _unlimitedSupplierAllowances[supplier];
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
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        _grantSupplierRole(supplier, amount);
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
        if (_unlimitedSupplierAllowances[supplier])
            revert AccountHasUnlimitedSupplierAllowance(supplier);
        _supplierAllowances[supplier] = amount;
        _grantRole(_getRoleId(RoleName.CASHIN), supplier);
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
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
    {
        _grantUnlimitedSupplierRole(supplier);
    }

    /**
     * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance, sets unlimited
     * supplier's allowance permission, and sets the `amount` the supplier can mint to 0.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function _grantUnlimitedSupplierRole(address supplier) internal {
        _unlimitedSupplierAllowances[supplier] = true;
        _supplierAllowances[supplier] = 0;
        _grantRole(_getRoleId(RoleName.CASHIN), supplier);
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
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
    {
        _revokeSupplierRole(supplier);
    }

    /**
     * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited
     * supplier's allowance permission.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     */
    function _revokeSupplierRole(address supplier) internal {
        _supplierAllowances[supplier] = 0;
        _unlimitedSupplierAllowances[supplier] = false;
        _revokeRole(_getRoleId(RoleName.CASHIN), supplier);
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
    )
        external
        override(ISupplierAdmin)
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
    {
        uint256 oldAllowance = _supplierAllowances[supplier];
        uint256 newAllowance = 0;
        _supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceReset(
            msg.sender,
            supplier,
            oldAllowance,
            newAllowance
        );
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
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        uint256 oldAllowance = _supplierAllowances[supplier];
        uint256 newAllowance = oldAllowance + amount;
        _supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceIncreased(
            msg.sender,
            supplier,
            amount,
            oldAllowance,
            newAllowance
        );
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
        onlyRole(_getRoleId(RoleName.ADMIN))
        addressIsNotZero(supplier)
        valueIsNotLessThan(amount, 0, false)
    {
        _decreaseSupplierAllowance(supplier, amount);
    }

    /**
     * @dev Validate that if the address account `supplier` isn't unlimited supplier's allowance,
     * and the `amount` not exceed the supplier allowance, subtracting the amount from supplier's allowance
     *
     * @param supplier The address of the supplier
     * @param amount The amount to check whether exceeds current supplier allowance
     */
    function _decreaseSupplierAllowance(
        address supplier,
        uint256 amount
    ) internal {
        uint256 oldAllowance = _supplierAllowances[supplier];
        if (amount > oldAllowance) revert GreaterThan(amount, oldAllowance);

        uint256 newAllowance = oldAllowance - amount;
        _supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceDecreased(
            msg.sender,
            supplier,
            amount,
            oldAllowance,
            newAllowance
        );
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private __gap;
}
