// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./IMintable.sol";
import "./SupplierAdmin.sol";
import "../TokenOwner.sol";
import "../Roles.sol";

abstract contract Mintable is IMintable, AccessControlUpgradeable, TokenOwner, Roles, SupplierAdmin {
    
    function _transfer(address from, address to, uint256 amount) internal virtual returns (bool) ; 
    /**
     * @dev Creates an `amount` of tokens and assigns them to an `account`, increasing
     * the total supply.
     *
     * Only the SUPPLIER_ROLE can execute.
     * The `amount` must be less than or equal to the supplier's allowance.
     * Minting reduces supplier's allowance.
     *
     * @param account The address that receives minted tokens
     * @param amount The number of tokens to be minted
     */
    function mint(address account, uint256 amount) 
        external       
        onlyRole(SUPPLIER_ROLE)  
        returns (bool) 
    {         
        controlAllowanceAmount(msg.sender, amount);
        (bool success) = HTSTokenOwner(_getTokenOwnerAddress()).mintToken(_getTokenAddress(), amount);
        require(success, "Minting error");
        return _transfer(_getTokenOwnerAddress(), account, amount);
    }
}