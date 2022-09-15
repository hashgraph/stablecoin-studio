// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./IBurnable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";

abstract contract Burnable is IBurnable, AccessControlUpgradeable, TokenOwner, Roles {
    
    function balanceOf(address account) public virtual view returns (uint256);

    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(uint256 amount) 
        external       
        onlyRole(SUPPLIER_ROLE)  
        returns (bool) 
    {         
        require(balanceOf(_getTokenOwnerAddress()) >= amount, "Amount is greater than treasury account balance");
        return HTSTokenOwner(_getTokenOwnerAddress()).burnToken(_getTokenAddress(), amount);
    }
}