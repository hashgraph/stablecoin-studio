// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./TokenOwner.sol";
import "./Roles.sol";
import "./Interfaces/IFreezable.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Freezable is IFreezable, TokenOwner, Roles {
    
   /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be freezed for the token
     */
     function freeze(address account) 
        external       
        onlyRole(_getRoleId(roleName.FREEZE))  
        returns (bool)
    {         
        int256 responseCode = IHederaTokenService(precompileAddress).freezeToken(_getTokenAddress(), account);
        bool success = _checkResponse(responseCode);
        
        emit TransfersFrozen(_getTokenAddress(), account); 

        return success;
    }

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be unfreezed for the token
     */
    function unfreeze(address account)
        external       
        onlyRole(FREEZE_ROLE)  
        returns (bool)
    {         
        int256 responseCode = IHederaTokenService(precompileAddress).unfreezeToken(_getTokenAddress(), account);
        bool success = _checkResponse(responseCode);
        
        emit TransfersUnfrozen(_getTokenAddress(), account);  

        return success;
    }
}