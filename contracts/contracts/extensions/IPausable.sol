// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IPausable {

   /**
    * @dev Emitted when the `amount` tokens are wiped from `account`
    *
    * @param token Token address
    */  
    event TokenPaused (address token);

   /**
    * @dev Emitted when the `amount` tokens are wiped from `account`
    *
    * @param token Token address
    */  
    event TokenUnpaused (address token);

    
    /**
     * @dev Pauses an `token` in order to prevent it from being involved in any kind of operation
     *
     * @param token The token to be paused
     */
    function pause(address token) external returns (bool); 

    /**
     * @dev Unpauses a `token` in order to allow it to be involved in any kind of operation
     *
     * @param token The token to be unpaused
     */
    function unpause(address token) external returns (bool); 
}