// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

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
        onlyRole(_getRoleId(RoleName.FREEZE))  
        checkAddressIsNotZero(account)
        override(IFreezable)
        returns (bool)
    {         
        emit TransfersFrozen(_getTokenAddress(), account); 

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS).freezeToken(_getTokenAddress(), account);

        bool success = _checkResponse(responseCode);
        
        return success;
    }

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be unfreezed for the token
     */
    function unfreeze(address account)
        external       
        onlyRole(_getRoleId(RoleName.FREEZE))  
        checkAddressIsNotZero(account)
        override(IFreezable)
        returns (bool)
    {         
        emit TransfersUnfrozen(_getTokenAddress(), account);  

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS).unfreezeToken(_getTokenAddress(), account);
        
        bool success = _checkResponse(responseCode);
        
        return success;
    }
}