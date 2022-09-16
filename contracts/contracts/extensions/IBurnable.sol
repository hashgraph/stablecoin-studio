// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IBurnable {
    
    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(uint256 amount) external returns (bool); 
}