// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./TokenOwner.sol";
import "./Roles.sol";

abstract contract HederaERC20Mintable is AccessControlUpgradeable, TokenOwner, Roles {
    
    function mint2(address account, uint256 amount) 
        external       
        onlyRole(SUPPLIER_ROLE)  
        returns (bool) 
    {         
        (bool success) = HTSTokenOwner(_getTokenOwnerAddress()).mintToken(_getTokenAddress(), amount);
        require(success, "Minting error");
        return true;

        //return _transfer(address(tokenOwnerAddress), account, amount);
    }
}