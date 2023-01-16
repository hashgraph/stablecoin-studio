// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

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
        override(IDeletable) 
        returns (bool)
    {         
        emit TokenDeleted(_getTokenAddress()); 

        int256 responseCode = IHederaTokenService(precompileAddress).deleteToken(_getTokenAddress());

        bool success = _checkResponse(responseCode);
        
        return success;
    }
}