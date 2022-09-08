// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./HTSTokenOwner.sol";

interface IHederaERC20 {

    /**
     * @dev Returns the name of the token.
     * 
     * @return The the name of the token.
     */
    function name() external view returns(string memory);

    /**
     * @dev Returns the symbol of the token.
     * 
     * @return The the symbol of the token.
     */
    function symbol() external view returns(string memory);

    /**
     * @dev Returns the number total of tokens in existence.
     * 
     * @return The number total of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the number tokens that an account has.
     *
     * @param account The address to be consulted
     *
     * @return The number number tokens that an account has.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Returns the number of decimal precision for the token.
     * 
     * @return The number of decimal precision.
     */
    function decimals() external view returns (uint8);   
}