// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./Interfaces/IBurnable.sol";
import "./TokenOwner.sol";
import "./Roles.sol";
import "../hts-precompile/IHederaTokenService.sol";


abstract contract Burnable is IBurnable, TokenOwner, Roles {
    
    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(uint256 amount) 
        external 
        onlyRole(_getRoleId(roleName.BURN))  
        returns (bool)      
    {         
        require(_balanceOf(address(this)) >= amount, "Amount is greater than treasury account balance");

        (int256 responseCode, ) = IHederaTokenService(precompileAddress).burnToken(_getTokenAddress(), uint64(amount),  new int64[](0));
        bool success = _checkResponse(responseCode);

        emit TokensBurned (msg.sender, _getTokenAddress(), amount);

        return success;
    }
}