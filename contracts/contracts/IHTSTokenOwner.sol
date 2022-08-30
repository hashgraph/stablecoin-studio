// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IHTSTokenOwner {
    function mintToken(address tokenAddress, uint256 amount) external returns (bool);
}