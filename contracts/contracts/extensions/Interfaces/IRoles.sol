// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IRoles {
    
    function getRoles(address account) external view returns (bytes32[] memory);
}