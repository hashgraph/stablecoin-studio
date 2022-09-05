// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IHTSTokenOwner {
    function mintToken(address tokenAddress, uint256 amount) external returns (bool);
    function wipeToken(address tokenAddress, address account, uint32 amount) external returns (bool);
    function tranferContract(address tokenAddress, address to, uint256 amount) external returns(bool);
}