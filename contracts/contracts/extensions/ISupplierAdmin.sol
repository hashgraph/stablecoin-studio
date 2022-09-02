// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ISupplierAdmin {
    
    function supplierAllowance(address supplier) external view returns (uint256) ;
    function resetSupplierAllowance(address supplier) external;
    function increaseSupplierAllowance(address supplier, uint256 amount) external; 
    function decreaseSupplierAllowance(address supplier, uint256 amount) external;
}