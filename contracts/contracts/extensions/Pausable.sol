// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IPausable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Pausable is IPausable, TokenOwner, Roles {
    
    /**
     * @dev Pauses the token in order to prevent it from being involved in any kind of operation
     *
     */
    function pause() 
        external       
        onlyRole(PAUSE_ROLE)  
        returns (bool) 
    {         
        bool success = HTSTokenOwner(_getTokenOwnerAddress()).pause(_getTokenAddress());
        
        emit TokenPaused(_getTokenAddress()); 
        return success;
    }

    /**
     * @dev Unpauses the token in order to allow it to be involved in any kind of operation
     *
     */
    function unpause()
        external       
        onlyRole(PAUSE_ROLE)  
        returns (bool) 
    {         
        bool success = HTSTokenOwner(_getTokenOwnerAddress()).unpause(_getTokenAddress());
        
        emit TokenUnpaused(_getTokenAddress()); 
        return success;
    }
}