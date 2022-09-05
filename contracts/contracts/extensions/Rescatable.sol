// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../IHTSTokenOwner.sol";
import "../IHederaERC20.sol";
import "../TokenOwner.sol";
import "./IRescatable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "../Roles.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

abstract contract Rescatable is IRescatable ,AccessControlUpgradeable, TokenOwner, Roles {
    
    /**
    * @dev Rescue `value` `tokenId` from contractTokenOwner to rescuer
    * 
    * Must be protected with isRescuer()
    */
    function rescueToken(uint256 amount)
    external
    onlyRole(ROLE_RESCUE)  
    {
        uint256 oldBalance = IHederaERC20(address(this)).balanceOf(address(_getTokenOwnerAddress()));
        require(oldBalance >= amount, "Amount must not exceed the token balance");
        
        IHTSTokenOwner(_getTokenOwnerAddress()).tranferContract(_getTokenAddress(),msg.sender, amount);

        emit TokenRescued (msg.sender, _getTokenAddress(), amount, oldBalance);
     
    }
    
    /**
    * @dev Rescue `value` hbar from contractTokenOwner to rescuer
    * Must be protected with isRescuer()
    */
    function rescueHbar(uint256 amount) 
    external
    onlyRole(ROLE_RESCUE) 
    {
        uint256 oldBalance = address(this).balance;
        require(oldBalance >= amount, "Amount must not exceed the hbar balance");

        uint256 hbarAmount = amount * 100000000;
        (bool succeed, ) = msg.sender.call{value: hbarAmount}("");
        require(succeed, "BaseToken: Failed to rescue Hbar");
                
        emit HbarRescued  (msg.sender, amount, oldBalance);
    }
}