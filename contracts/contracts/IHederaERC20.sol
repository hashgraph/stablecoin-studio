// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./HTSTokenOwner.sol";

interface IHederaERC20 {

    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external; 

    function getTokenAddress() external view returns (address);

    function name() external view returns(string memory);

    function symbol() external view returns(string memory);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function decimals() external view returns (uint8);

    function mint(address account, uint256 amount) external returns (bool);  

    function burn(uint256 amount) external returns (bool);

}