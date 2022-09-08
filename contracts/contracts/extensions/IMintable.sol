// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IMintable {
    
     /**
     * @dev Creates an `amount` of tokens and assigns them to an `account`, increasing
     * the total supply
     *
     * @param account The address that receives minted tokens
     * @param amount The number of tokens to be minted
     */
    function mint(address account, uint256 amount) external returns (bool); 
}