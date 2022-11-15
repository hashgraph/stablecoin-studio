// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IPausable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Pausable is IPausable, TokenOwner, Roles {
    
    /**
     * @dev Pauses an `token` in order to prevent it from being involved in any kind of operation
     *
     * @param token The token to be paused
     */
    function pause(address token) 
        external       
        onlyRole(PAUSE_ROLE)  
    {         
        int responseCode = IHederaTokenService(precompiledAddress).pauseToken(token);
        _checkResponsecode(responseCode);
        
        emit TokenPaused(token); 
    }

    /**
     * @dev Unpauses a `token` in order to allow it to be involved in any kind of operation
     *
     * @param token The token to be unpaused
     */
    function unpause(address token)
        external       
        onlyRole(PAUSE_ROLE)  
    {         
        int responseCode = IHederaTokenService(precompiledAddress).unpauseToken(token);
        _checkResponsecode(responseCode);
        
        emit TokenUnpaused(token); 
    }
}