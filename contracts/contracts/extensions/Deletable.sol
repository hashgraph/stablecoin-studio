// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IDeletable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Deletable is IDeletable, TokenOwner, Roles {
    
    /**
     * @dev Deletes the token 
     *
     */
    function deleteToken() 
        external       
        onlyRole(DELETE_ROLE)  
        returns (bool) 
    {         
        bool success = HTSTokenOwner(_getTokenOwnerAddress()).remove(_getTokenAddress());
        
        emit TokenDeleted(_getTokenAddress()); 
        return success;
    }
}