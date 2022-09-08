// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./ISupplierAdmin.sol";
import "../TokenOwner.sol";
import "../Roles.sol";

abstract contract SupplierAdmin is ISupplierAdmin, AccessControlUpgradeable, TokenOwner, Roles {

    mapping(address => uint256) internal supplierAllowances;
    mapping(address => bool) internal unlimitedSupplierAllowances;

     /**
     * @dev Emitted when a supply controller increases a supplier's allowance
     * 
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param amount The amount to increase supplier allowance by
     * @param oldAllowance The supplier allowance before the increase
     * @param newAllowance The supplier allowance after the increase
     */
    event SupplierAllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);
    
    /**
     * @dev Emitted when a supply controller decreases a supplier's allowance
     * 
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param amount The amount to decrease supplier allowance by
     * @param oldAllowance The supplier allowance before the decrease
     * @param newAllowance The supplier allowance after the decrease
     */
    event SupplierAllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);

    /**
     * @dev Emitted when a supply controller resets a supplier's allowance
     * 
     * @param sender The caller of the function that emitted the event
     * @param supplier The supplier account
     * @param oldAllowance The supplier allowance before the reset
     * @param newAllowance The supplier allowance after the reset (expected to be 0)
     */
    event SupplierAllowanceReset(address indexed sender, address indexed supplier, uint256 oldAllowance, uint256 newAllowance);

    /**
     * @dev Retrun number of tokens allowed to be minted of the address account `supplier`.
     *
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     * 
    */
    function supplierAllowance(address supplier) 
        external 
        view 
        returns (uint256) 
    {
        return supplierAllowances[supplier];
    }

    /**
     * @dev Validate if the address account `supplier' is unlimited supplier's allowance.
     *
     * @param supplier The address of the supplier
     * @return True if is unlimited supplier's allowance
     * 
    */
    function isUnlimitedSupplierAllowance(address supplier) 
        external 
        view 
        returns (bool) 
    {
        return unlimitedSupplierAllowances[supplier];
    }

    /**
     * @dev  Gives `SUPPLIER ROLE' permissions to perform supplier's allowance and sets the `amount` the supplier can mint,
     * if you don't already have unlimited supplier's allowance permission.
     * Only the 'ADMIN SUPPLIER ROLE` can execute.
     *
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     * 
    */
    function grantSupplierRole(address supplier, uint256 amount)
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {
        require(!unlimitedSupplierAllowances[supplier], "Account already has unlimited supplier allowance");
        supplierAllowances[supplier] = amount;
        _grantRole(SUPPLIER_ROLE, supplier);
        
    }

    /** 
    * @dev Gives `SUPPLIER ROLE' permissions to perform supplier's allowance, sets unlimited supplier's allowance permission,
    * and sets the `amount` the supplier can mint to 0.
    * Only the 'ADMIN SUPPLIER ROLE` can execute.
    *
    * @param supplier The address of the supplier
    */
    function grantUnlimitedSupplierRole(address supplier)
        public 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {
        unlimitedSupplierAllowances[supplier] = true;
        supplierAllowances[supplier] = 0;
        _grantRole(SUPPLIER_ROLE, supplier);
    }

    /**
    * @dev Revoke `SUPPLIER ROLE' permissions to perform supplier's allowance and revoke unlimited supplier's allowance permission.    
    * Only the 'ADMIN SUPPLIER ROLE` can execute.
    *
    * @param supplier The address of the supplier
    */
    function revokeSupplierRole(address supplier)
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {
        supplierAllowances[supplier] = 0;
        unlimitedSupplierAllowances[supplier] = false;
        _revokeRole(SUPPLIER_ROLE, supplier);
    }

    /**
    * @dev Reset a supplier's allowance to 0.
    * Emits a SupplierAllowanceReset event
    * Only the 'ADMIN SUPPLIER ROLE` can execute
    *
    * @param supplier The address of the supplier
    */
    function resetSupplierAllowance(address supplier) 
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {    
        uint256 oldAllowance = supplierAllowances[supplier];
        uint256 newAllowance = 0;
        supplierAllowances[supplier] = newAllowance;

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
    function increaseSupplierAllowance(address supplier, uint256 amount) 
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 oldAllowance = supplierAllowances[supplier];
        uint256 newAllowance = oldAllowance + amount;  
        supplierAllowances[supplier] = newAllowance;
        
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
    function decreaseSupplierAllowance(address supplier, uint256 amount) 
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) 
    {
        require(amount > 0, "Amount must be greater than zero");
    
        uint256 oldAllowance = supplierAllowances[supplier];
        require(amount <= oldAllowance, "Amount must not exceed the supplier allowance");
        
        uint256 newAllowance = oldAllowance - amount;
        supplierAllowances[supplier] = newAllowance;
    
        emit SupplierAllowanceDecreased(msg.sender, supplier, amount, oldAllowance, newAllowance);
    }    

   /**
    * @dev Validate that if the address account `supplier` isn't unlimited supplier's allowance, 
    * and the `amount` not exceed the supplier allowance, subtracting the amount from supplier's allowance
    *
    * @param supplier The address of the supplier
    * @param amount The amount to check whether exceeds current supplier allowance
    */
    function controlAllowanceAmount(address supplier, uint256 amount) 
        public
        virtual
    {
        if (!unlimitedSupplierAllowances[supplier]) {
            uint256 allowance = supplierAllowances[supplier];
            require(allowance >= amount, "Amount must not exceed the supplier allowance");
            supplierAllowances[supplier] = allowance - amount;
        }
    }
}