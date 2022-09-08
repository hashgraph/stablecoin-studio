// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./HTSTokenOwner.sol";

interface IHederaERC20 {

    /**
     * @dev Returns the name of the token
     * 
     * @return The the name of the token
     */
    function name() external view returns(string memory);

    /**
     * @dev Returns the symbol of the token
     *
     * @return The the symbol of the token
     */
    function symbol() external view returns(string memory);

    /**
     * @dev Returns the total number of tokens that exits
     * 
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Returns the number of decimals of the token
     * 
     * @return uint8 The number of decimals of the token
     */
    function decimals() external view returns (uint8);   
}