// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ISupplierAdmin {
    
    function supplierAllowance(address supplier) external view returns (uint256);
    function isUnlimitedSupplierAllowance(address supplier) external view returns (bool);
    function grantSupplierRole(address supplier, uint256 amount) external virtual;
    function grantUnlimitedSupplierRole(address supplier) external virtual;
    function revokeSupplierRole(address supplier) external virtual; 
    function resetSupplierAllowance(address supplier) external;
    function increaseSupplierAllowance(address supplier, uint256 amount) external; 
    function decreaseSupplierAllowance(address supplier, uint256 amount) external;
    function controlAllowanceAmount(address supplier, uint256 amount) external virtual;
}