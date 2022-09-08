// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ISupplierAdmin {
    
    /**
     * @dev Retrun number of tokens allowed to be minted of the address account `supplier`.
     *
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     * 
    */
    function supplierAllowance(address supplier) external view returns (uint256);
    
    /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance.
     *
     * @param supplier The address of the supplier
     * @return True if is unlimited supplier's allowance
     * 
    */
    function isUnlimitedSupplierAllowance(address supplier) external view returns (bool);

     /**
     * @dev  Gives `SUPPLIER ROLE' permissions to perform supplier's allowance and sets the `amount` the supplier can mint,
     * if you don't already have unlimited supplier's allowance permission.
     *
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     * 
    */
    function grantSupplierRole(address supplier, uint256 amount) external virtual;

    /** 
    * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance, sets unlimited supplier's allowance permission,
    * and sets the `amount` the supplier can mint to 0.
    *
    * @param supplier The address of the supplier
    */
    function grantUnlimitedSupplierRole(address supplier) external virtual;

    /**
    * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited supplier's allowance permission.    
    *
    * @param supplier The address of the supplier
    */
    function revokeSupplierRole(address supplier) external virtual; 

    /**
    * @dev Reset a supplier's allowance to 0.
    *
    * @param supplier The address of the supplier
    */
    function resetSupplierAllowance(address supplier) external;

    /**
    * @dev Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint.
    *
    * @param supplier The address of the supplier
    * @param amount The amount to add to the supplier's current minting allowance
    */
    function increaseSupplierAllowance(address supplier, uint256 amount) external; 

    /**
    * @dev Decreases the minting allowance of the `supplier`, reducing the `amount` that the supplier can mint.
    *
    * @param supplier The address of the supplier
    * @param amount The amount to subtract from the supplier's current minting allowance
    */
    function decreaseSupplierAllowance(address supplier, uint256 amount) external;

    /**
    * @dev Validate that if the address account `supplier` isn't unlimited supplier's allowance, 
    * and the amount `amount`  not exceed the supplier allowance, subtract the amount from supplier's allowance.
    *
    * @param supplier The address of the supplier
    * @param amount The amount to add to the supplier's current minting allowance
    */
    function controlAllowanceAmount(address supplier, uint256 amount) external virtual;
}