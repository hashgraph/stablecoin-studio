// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IBurnable {

    /**
    * @dev Emitted when the `amount` tokens are burned from TokenOwner
    *
    * @param burner The caller of the function that emitted the event
    * @param token Token address
    * @param amount The number of tokens to burn
    */  
    event TokensBurned(address burner, address token, uint256 amount);
    
    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(uint256 amount) external returns (bool); 
}