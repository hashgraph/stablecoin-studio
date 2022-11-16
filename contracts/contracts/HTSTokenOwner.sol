// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./hts-precompile/HederaTokenService.sol";
import "./IHTSTokenOwner.sol";
import "./TokenOwner.sol";

contract HTSTokenOwner is IHTSTokenOwner, HederaTokenService {
    using SafeERC20Upgradeable for IERC20Upgradeable; 

    address public erc20address;

    /**
     * @dev Checks is message sender is the HederaERC20 contract
     */
    modifier onlyHederaERC20() {
        require (msg.sender == erc20address, "Caller is not HederaERC20 contract");
        _;
    }

    /**
     * @dev Sets the HederaERC20 contract address
     *
     * @param _erc20address The address of the HederaERC20 contract
     */
    function setERC20Address(address _erc20address) 
        external 
    {
        require(erc20address == address(0), "ERC20 address already defined");
        erc20address = _erc20address;
    }

    /**
     * @dev Creates an `amount` of tokens and transfers them to an `account`, increasing
     * the total supply
     *
     * @param tokenAddress The address of the token we want to mint
     * @param amount The number of tokens to be minted
     */
    function mintToken(address tokenAddress, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        (int256 responseCode, , ) = HederaTokenService
            .mintToken(tokenAddress, uint64(amount), new bytes[](0));
        return _checkResponse(responseCode);
    }

   /**
    * @dev Burns an `amount` of tokens owned by the treasury account
    *
    * @param tokenAddress The address of the token we want to burn
    * @param amount The number of tokens to be burned
    */
    function burnToken(address tokenAddress, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool)
    {
        (int256 responseCode, ) = HederaTokenService
            .burnToken(tokenAddress, uint64(amount), new int64[](0));
        return _checkResponse(responseCode);
    }

    /**
    * @dev Transfer an amount of tokens from an account to another account
    *    
    * @param tokenAddress The address of the token we want to transfer
    * @param from The address of the account the tokens will be transferred from
    * @param from The address of the account the tokens will be transferred to
    * @param amount The number of tokens to transfer
    * @return boolean True if successful       
    */
    function transfer(address tokenAddress, address from, address to, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 transferResponse = HederaTokenService.transferToken(tokenAddress, from, to, int64(int256(amount)));
        return _checkResponse(transferResponse);
    }

    /**
    * @dev Wipes an amount of tokens from an account
    *    
    * @param tokenAddress The address of the token we want to wipe
    * @param account The address of the where tokens will be wiped
    * @param amount The number of tokens to wipe
    * @return boolean True if successful       
    */
    function wipeToken(address tokenAddress, address account, uint32 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.wipeTokenAccount(tokenAddress, account, uint32(amount));
        return _checkResponse(responseCode);
    }

    function pause(address tokenAddress) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.pauseToken(tokenAddress);
        return _checkResponse(responseCode);
    }


    function unpause(address tokenAddress) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.unpauseToken(tokenAddress);
        return _checkResponse(responseCode);
    }


    function freeze(address tokenAddress, address account) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.freezeToken(tokenAddress, account);
        return _checkResponse(responseCode);
    }


    function unfreeze(address tokenAddress, address account) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.unfreezeToken(tokenAddress, account);
        return _checkResponse(responseCode);
    }

   /**
    * @dev Transfers an amount of token from the token owner contract to an account
    *    
    * @param tokenAddress The address of the token we want to transfer
    * @param to The address of the account the tokens will be transferred
    * @param amount The number of tokens to transfer
    * @return boolean True if successful       
    */
    function tranferContract(address tokenAddress,address to, uint256 amount) 
        external
        override
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 transferResponse = HederaTokenService.transferToken(tokenAddress, address(this), 
                                    to, int64(int256(amount)));
        return _checkResponse(transferResponse);
    }

    /**
    * @dev Transforms the response from a HederaResponseCodes to a boolean
    *
    * @param responseCode The Hedera response code to transform
    * @return bool True if successful
    */
    function _checkResponse(int256 responseCode) 
        internal 
        pure
        returns (bool) 
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
        return true;
    }
}