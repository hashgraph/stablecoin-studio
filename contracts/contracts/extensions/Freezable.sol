// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./IFreezable.sol";
import "../TokenOwner.sol";
import "../Roles.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Freezable is IFreezable, TokenOwner, Roles {
    
   /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be freezed for the token
     */
     function freeze(address account) 
        external       
        onlyRole(FREEZE_ROLE)  
        returns (bool) 
    {         
        bool success = HTSTokenOwner(_getTokenOwnerAddress()).freeze(_getTokenAddress(), account);
        
        emit TransfersFreezed(_getTokenAddress(), account); 
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
        bool success = HTSTokenOwner(_getTokenOwnerAddress()).unfreeze(_getTokenAddress(), account);
        
        emit TransfersUnfreezed(_getTokenAddress(), account); 
        return success;
 
    }
}