// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./HTSTokenOwner.sol";

interface ITokenOwner {
    
    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external;
    function getTokenAddress() external view returns(address);
    function getTokenOwnerAddress() external view returns(address);
}