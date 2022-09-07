// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IWipeable   {

    /**
    * @dev Emitted when the amount tokens ('amount') are wiped from account (`account`) .
     *
    */  
    event TokensWiped (address token, address account, uint32 amount);

    /**
    * @dev Operation to wipe a token amount (`amount`) from account (`account`).    
    * Validate that there is sufficient token balance before wipe
    * 
    * @param account The address of the account where to wipe the token
    * @param amount The amount to wipe
    * @return True if successful       
    */
    function wipe(address account, uint32 amount) external returns (bool) ;
    
}