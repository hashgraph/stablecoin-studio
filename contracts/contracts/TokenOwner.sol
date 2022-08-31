// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./ITokenOwner.sol";

abstract contract TokenOwner is ITokenOwner {
    
    HTSTokenOwner HTSTokenOwnerAddress;
    address tokenAddress; 

    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) 
        external         
    {
        require(tokenAddress == address(0), "Token address already defined");

        HTSTokenOwnerAddress = _htsTokenOwnerAddress;
        tokenAddress = _tokenAddress;
    }

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