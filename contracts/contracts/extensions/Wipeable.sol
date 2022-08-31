// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "./../TokenOwner.sol";
import "./../Roles.sol";
import "./../IHederaERC20.sol";
import "./IWipeable.sol";

abstract contract Wipeable is IWipeable, AccessControlUpgradeable, TokenOwner, Roles {
       
    function wipe(address account, uint32 amount) 
        external       
        onlyRole(WIPE_ROLE)  
        returns (bool) 
    {      
        require(IHederaERC20(address(this)).balanceOf(account) >= amount, "Insufficient token balance for wiped");   

        (bool success) = HTSTokenOwner(_getTokenOwnerAddress()).wipeToken(_getTokenAddress(), account, amount);
        require(success, "Wiped error");

        emit TokensWiped (_getTokenAddress(), account, amount);

        return true;        
    }
}