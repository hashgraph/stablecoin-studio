// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IWipeable   {

    /**
    * @dev Emitted when the `amount` tokens are wiped from `account`
    *
    * @param token Token address
    * @param account The address of the account where to wipe the token
    * @param amount The number of tokens to wipe
    */  
    event TokensWiped(address wiper, address token, address account, uint32 amount);

    /**
    * @dev Operation to wipe a token `amount` from `account`
    * Validate that there is sufficient token balance before wipe
    * 
    * @param account The address of the account where to wipe the token
    * @param amount The number of tokens to wipe
    */
    function wipe(address account, uint32 amount) external;
    
}