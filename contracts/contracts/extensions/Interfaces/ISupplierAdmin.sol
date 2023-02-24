// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface ISupplierAdmin {
    /**
     * @dev Emitted when a supply controller increases a supplier's allowance
     *
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param amount The amount to increase supplier allowance by
     * @param oldAllowance The supplier allowance before the increase
     * @param newAllowance The supplier allowance after the increase
     */
    event SupplierAllowanceIncreased(
        address indexed sender,
        address indexed supplier,
        uint256 amount,
        uint256 oldAllowance,
        uint256 newAllowance
    );

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
     * @dev Emitted when a supply controller resets a supplier's allowance
     *
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param oldAllowance The supplier allowance before the reset
     * @param newAllowance The supplier allowance after the reset (expected to be 0)
     */
    event SupplierAllowanceReset(
        address indexed sender,
        address indexed supplier,
        uint256 oldAllowance,
        uint256 newAllowance
    );

    /**
     * @dev Return number of tokens allowed to be minted of the address account `supplier`
     *
     * @param supplier The address of the supplier
     * @return uint256 The number of tokens allowed to be minted
     *
     */
    function getSupplierAllowance(
        address supplier
    ) external view returns (uint256);

    /**
     * @dev Validate if the address account `supplier' has unlimited supplier's allowance
     *
     * @param supplier The address of the supplier
     * @return bool True if is unlimited supplier's allowance
     *
     */
    function isUnlimitedSupplierAllowance(
        address supplier
    ) external view returns (bool);

    /**
     * @dev  Gives `SUPPLIER ROLE' permissions to perform supplier's allowance and sets the `amount`
     * the supplier can mint, if you don't already have unlimited supplier's allowance permission
     *
     * @param supplier The address of the supplier
     * @param amount The amount of tokens to set the supplier allowance
     *
     */
    function grantSupplierRole(address supplier, uint256 amount) external;

    /**
     * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance and sets unlimited
     * supplier's allowance permission.
     *
     * @param supplier The address of the supplier
     */
    function grantUnlimitedSupplierRole(address supplier) external;

    /**
     * @dev Revoke `SUPPLIER ROLE' to perform supplier's allowance and revoke unlimited supplier's allowance permission
     *
     * @param supplier The address of the supplier
     */
    function revokeSupplierRole(address supplier) external;

    /**
     * @dev Reset the supplier's allowance to 0
     *
     * @param supplier The address of the supplier
     */
    function resetSupplierAllowance(address supplier) external;

    /**
     * @dev Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint
     *
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     */
    function increaseSupplierAllowance(
        address supplier,
        uint256 amount
    ) external;

    /**
     * @dev Decreases the supplier allowance of the `supplier`, reducing the `amount` that the supplier can mint
     *
     * @param supplier The address of the supplier
     * @param amount The amount to subtract from the supplier's current supplier allowance
     */
    function decreaseSupplierAllowance(
        address supplier,
        uint256 amount
    ) external;
}
