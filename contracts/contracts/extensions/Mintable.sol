// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";

abstract contract Mintable is AccessControlUpgradeable, TokenOwner, Roles {
    
    function _transfer(address from, address to, uint256 amount) internal virtual returns (bool) ; 

    function mint(address account, uint256 amount) 
        external       
        onlyRole(SUPPLIER_ROLE)  
        returns (bool) 
    {         
        (bool success) = HTSTokenOwner(_getTokenOwnerAddress()).mintToken(_getTokenAddress(), amount);
        require(success, "Minting error");
        return _transfer(_getTokenOwnerAddress(), account, amount);
    }
}