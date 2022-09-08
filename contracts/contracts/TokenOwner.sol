// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./ITokenOwner.sol";

abstract contract TokenOwner is ITokenOwner {
    
    HTSTokenOwner HTSTokenOwnerAddress;
    address tokenAddress; 

    /**
     * @dev Assigns the address contract HTSTokenOwner and the address of the token. Validating that the token address is not already assigned
     *
     * @param _htsTokenOwnerAddress The address contract HTSTokenOwner
     * @param _tokenAddress The address token created
     */
    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) 
        external         
    {
        require(tokenAddress == address(0), "Token address already defined");

        HTSTokenOwnerAddress = _htsTokenOwnerAddress;
        tokenAddress = _tokenAddress;
    }

    /**
     * @dev Returns the address token.
     * 
     * @return The address token.
     */
    function getTokenAddress()  
        public
        view 
        returns (address) 
    {
        return _getTokenAddress();
    }

    function _getTokenAddress()  
        internal
        view 
        returns (address) 
    {
        return tokenAddress;
    }

    /**
     * @dev Returns the address HTSTokenOwner.
     * 
     * @return The address HTSTokenOwner.
     */
    function getTokenOwnerAddress()
        public
        view 
        returns (address) 
    {
        return _getTokenOwnerAddress();
    }

    function _getTokenOwnerAddress()
        internal
        view 
        returns (address) 
    {
        return address(HTSTokenOwnerAddress);
    }
}