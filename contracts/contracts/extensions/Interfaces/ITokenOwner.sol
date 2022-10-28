// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface ITokenOwner {
    
    /**
     * @dev Returns the token address
     * 
     * @return address The token address
     */
    function getTokenAddress() external view returns(address);
}