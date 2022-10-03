// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./HTSTokenOwner.sol";

interface ITokenOwner {
    
    /**
     * @dev Assigns the HTSTokenOwner contract address and the token address, validating that the 
     *      token address was not already assigned
     *
     * @param htsTokenOwnerAddress The  contract address HTSTokenOwner
     * @param tokenAddress The token address created
     */
    function setTokenAddress(HTSTokenOwner htsTokenOwnerAddress, address tokenAddress) external;
    
    /**
     * @dev Returns the token address
     * 
     * @return address The token address
     */
    function getTokenAddress() external view returns(address);

    /**
     * @dev Returns the HTSTokenOwner contract address 
     * 
     * @return address HTSTokenOwner contract address
     */
    function getTokenOwnerAddress() external view returns(address);
}