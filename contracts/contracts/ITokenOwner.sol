// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./HTSTokenOwner.sol";

interface ITokenOwner {
    
    /**
     * @dev Assigns the address contract HTSTokenOwner and the address of the token. Validating that the token address is not already assigned
     *
     * @param _htsTokenOwnerAddress The address contract HTSTokenOwner
     * @param _tokenAddress The address token created
     */
    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external;
    /**
     * @dev Returns the address token.
     * 
     * @return The address token.
     */     
    function getTokenAddress() external view returns(address);
      /**
     * @dev Returns the address HTSTokenOwner.
     * 
     * @return The address HTSTokenOwner.
     */
    function getTokenOwnerAddress() external view returns(address);
}