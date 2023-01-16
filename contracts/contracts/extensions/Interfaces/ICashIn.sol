// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface ICashIn {
    /**
    * @dev Emitted when the `amount` tokens have been minted to account
    *
    * @param minter The caller of the function that emitted the event
    * @param token Token address
    * @param amount The number of tokens to mint
    * @param account Account address
    */  
    event TokensMinted(address minter, address token, uint256 amount, address account);
    
     /**
     * @dev Creates an `amount` of tokens and transfers them to an `account`, increasing
     * the total supply
     *
     * @param account The address that receives minted tokens
     * @param amount The number of tokens to be minted
     */
    function mint(address account, uint256 amount) external returns (bool); 
}