// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./../TokenOwner.sol";
import "./../Roles.sol";
import "./../IHederaERC20.sol";
import "./IWipeable.sol";

abstract contract Wipeable is IWipeable, TokenOwner, Roles {

    /**
    * @dev Operation to wipe a token amount (`amount`) from account (`account`).    
    *
    * Validate that there is sufficient token balance before wipe.
    *
    * Only the 'WIPE ROLE` can execute
    * Emits a TokensWiped event
    * 
    * @param account The address of the account where to wipe the token
    * @param amount The number of tokens to wipe
    * @return True if successful    
    */
    function wipe(address account, uint32 amount) 
        external       
        onlyRole(WIPE_ROLE)  
        returns (bool) 
    {      
        require(IHederaERC20(address(this)).balanceOf(account) >= amount, "Insufficient token balance for wiped");   

        (bool success) = HTSTokenOwner(_getTokenOwnerAddress()).wipeToken(_getTokenAddress(), account, amount);
        require(success, "Wiped error");

        emit TokensWiped (_getTokenAddress(), account, amount);

        return true;        
    }
}