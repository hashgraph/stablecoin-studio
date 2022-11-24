// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./TokenOwner.sol";
import "./Roles.sol";
import "./Interfaces/IDeletable.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Deletable is IDeletable, TokenOwner, Roles {
    
    /**
     * @dev Deletes the token 
     *
     */
    function deleteToken() 
        external       
        onlyRole(_getRoleId(roleName.DELETE))  
    {         
        int256 responseCode = IHederaTokenService(precompileAddress).deleteToken(_getTokenAddress());
        _checkResponse(responseCode); 
        
        emit TokenDeleted(_getTokenAddress()); 
    }
}