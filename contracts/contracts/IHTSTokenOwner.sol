// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IHTSTokenOwner {
    
    /**
     * @dev Creates an `amount` of tokens and transfers them to an `account`, increasing
     * the total supply
     *
     * @param tokenAddress The address of the token we want to mint
     * @param amount The number of tokens to be minted
     */
    function mintToken(address tokenAddress, uint256 amount) external returns (bool);
    
    /**
    * @dev Wipes an amount of tokens from an account
    *    
    * @param tokenAddress The address of the token we want to wipe
    * @param account The address of the where tokens will be wiped
    * @param amount The number of tokens to wipe
    * @return boolean True if successful       
    */
    function wipeToken(address tokenAddress, address account, uint32 amount) external returns (bool);
    
   /**
    * @dev Transfers an amount of token from the token owner contract to an account
    *    
    * @param tokenAddress The address of the token we want to transfer
    * @param to The address of the account the tokens will be transferred
    * @param amount The number of tokens to transfer
    * @return boolean True if successful       
    */
    function tranferContract(address tokenAddress, address to, uint256 amount) external returns(bool);
}