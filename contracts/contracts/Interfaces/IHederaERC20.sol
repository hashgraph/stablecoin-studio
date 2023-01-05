// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

interface IHederaERC20 {
    /**
     * @dev Emitted when the token has been associated to the account
     *
     * @param token Token address
     * @param account Account address
     */
    event TokenAssociated(address token, address account);

    /**
     * @dev Emitted when the token has been dissociated from the account
     *
     * @param token Token address
     * @param account Account address
     */
    event TokenDissociated(address token, address account);

    /**
    * @dev Emitted when tokens have been transfered from sender to receiver
    *
    * @param token Token address
    * @param sender Sender address
    * @param receiver Receiver address
    * @param amount Transfered amount

    */
    event TokenTransfer(
        address token,
        address sender,
        address receiver,
        uint256 amount
    );

    /**
     * @dev Returns the name of the token
     *
     * @return The the name of the token
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token
     *
     * @return The the symbol of the token
     */
    function symbol() external view returns (string memory);

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
