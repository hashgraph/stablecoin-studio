// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./ITokenOwner.sol";
import "./hts-precompile/HederaResponseCodes.sol";

abstract contract TokenOwner is ITokenOwner {
    
    // Hedera HTS precompiled contract
    address constant precompiledAddress = address(0x167);

    HTSTokenOwner internal _htsTokenOwnerAddress;
    address internal _tokenAddress; 

    /**
     * @dev Assigns the HTSTokenOwner contract address and the token address, validating that the 
     * token address was not already assigned
     *
     * @param htsTokenOwnerAddress The  contract address HTSTokenOwner
     * @param tokenAddress The token address created
     */
    function setTokenAddress(HTSTokenOwner htsTokenOwnerAddress, address tokenAddress) 
        external         
    {
        require(_tokenAddress == address(0), "Token address already defined");

        _htsTokenOwnerAddress = htsTokenOwnerAddress;
        _tokenAddress = tokenAddress;
    }

    /**
     * @dev Returns the token address
     * 
     * @return address The token address
     */
    function getTokenAddress()  
        public
        view 
        returns (address) 
    {
        return _getTokenAddress();
    }

    /**
     * @dev Returns the token address
     * 
     * @return address The token address
     */
    function _getTokenAddress()  
        internal
        view 
        returns (address) 
    {
        return _tokenAddress;
    }

    /**
     * @dev Returns the HTSTokenOwner contract address 
     * 
     * @return address HTSTokenOwner contract address
     */
    function getTokenOwnerAddress()
        public
        view 
        returns (address) 
    {
        return _getTokenOwnerAddress();
    }

    /**
     * @dev Returns the HTSTokenOwner contract address 
     * 
     * @return address HTSTokenOwner contract address
     */
    function _getTokenOwnerAddress()
        internal
        view 
        returns (address) 
    {
        return address(_htsTokenOwnerAddress);
    }

   /**
    * @dev Transforms the response from a HederaResponseCodes to a boolean
    *
    * @param responseCode The Hedera response code to transform
    */
    function _checkResponse(int256 responseCode) 
        internal 
        pure
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
    }    
}