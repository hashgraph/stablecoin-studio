// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./ISupplierAdmin.sol";
import "../TokenOwner.sol";
import "../Roles.sol";

abstract contract SupplierAdmin is ISupplierAdmin, AccessControlUpgradeable, TokenOwner, Roles {

    mapping(address => uint256) internal supplierAllowances;

    event SupplierAllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);
    event SupplierAllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);
    event SupplierAllowanceReset(address indexed sender, address indexed supplier, uint256 oldAllowance, uint256 newAllowance);

    function supplierAllowance(address supplier) 
        external 
        view 
        returns (uint256) 
    {
        return supplierAllowances[supplier];
    }

    function grantSupplierRole(address supplier)
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) {

        supplierAllowances[supplier] = 0;
        _grantRole(SUPPLIER_ROLE, supplier);
    }

    function revokeSupplierRole(address supplier)
        external 
        virtual 
        onlyRole(ADMIN_SUPPLIER_ROLE) {

        supplierAllowances[supplier] = 0;
        _revokeRole(SUPPLIER_ROLE, supplier);
    }

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
}