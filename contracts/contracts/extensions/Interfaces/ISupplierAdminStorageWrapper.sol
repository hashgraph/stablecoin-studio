// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ISupplierAdminStorageWrapper {
    /**
     * @dev Emitted when a supply controller decreases a supplier's allowance
     *
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param amount The amount to decrease supplier allowance by
     * @param oldAllowance The supplier allowance before the decrease
     * @param newAllowance The supplier allowance after the decrease
     */
    event SupplierAllowanceDecreased(
        address indexed sender,
        address indexed supplier,
        uint256 amount,
        uint256 oldAllowance,
        uint256 newAllowance
    );

    /**
     * @dev Emitted when the supplier account already has unlimited supplier allowance
     *
     * @param account The account to grant supplier role to
     */
    error AccountHasUnlimitedSupplierAllowance(address account);
}
