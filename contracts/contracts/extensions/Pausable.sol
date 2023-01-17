// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import "./TokenOwner.sol";
import "./Roles.sol";
import "./Interfaces/IPausable.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Pausable is IPausable, TokenOwner, Roles {
    
    /**
     * @dev Pauses the token in order to prevent it from being involved in any kind of operation
     *
     */
    function pause() 
        external       
        onlyRole(_getRoleId(RoleName.PAUSE))  
        override(IPausable)
        returns (bool)
    {         
        emit TokenPaused(_getTokenAddress()); 

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS).pauseToken(_getTokenAddress());
        
        bool success = _checkResponse(responseCode);
        
        return success;
    }

    /**
     * @dev Unpauses the token in order to allow it to be involved in any kind of operation
     *
     */
    function unpause()
        external       
        onlyRole(_getRoleId(RoleName.PAUSE))  
        override(IPausable)
        returns (bool)
    {         
        emit TokenUnpaused(_getTokenAddress()); 

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS).unpauseToken(_getTokenAddress());

        bool success = _checkResponse(responseCode);
        
        return success;
    }
}