// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ISupplierAdmin {
    
    /**
     * @dev Retrun number of tokens allowed to be minted of the address account `supplier`
     * 
    */
    function supplierAllowance(address supplier) external view returns (uint256);
    
    /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance
     * 
    */
    function isUnlimitedSupplierAllowance(address supplier) external view returns (bool);

     /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance
     * Only the 'ADMIN SUPPLIER ROLE` can execute
     * 
    */
    function grantSupplierRole(address supplier, uint256 amount) external virtual;

    /** 
    * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance if you don't already have unlimited supplier's allowance permission.
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    */
    function grantUnlimitedSupplierRole(address supplier) external virtual;

    /**
    * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited supplier's allowance permission.    
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    */
    function revokeSupplierRole(address supplier) external virtual; 

    /**
    * @dev Reset a supplier's allowance to 0.
    * Emits a SupplierAllowanceReset event
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    */
    function resetSupplierAllowance(address supplier) external;

    /**
    * @dev Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint
    * Validate that the amount must be greater than zero
    * Emits a SupplierAllowanceIncreased event
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    */
    function increaseSupplierAllowance(address supplier, uint256 amount) external; 

    /**
    * @dev Decreases the minting allowance of the `supplier`, reducing the `amount` that the supplier can mint
    * Validate that the amount must be greater than zero, and the amount must not exceed the supplier allowance
    * Emits a SupplierAllowanceDecreased event
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    */
    function decreaseSupplierAllowance(address supplier, uint256 amount) external;

    /**
    * @dev Validate that if the address account `supplier` isn't unlimited supplier's allowance, 
    * and the amount `amount`  not exceed the supplier allowance, subtract the amount from supplier's allowance.
    *
    */
    function controlAllowanceAmount(address supplier, uint256 amount) external virtual;
}