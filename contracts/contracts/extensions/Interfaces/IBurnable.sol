// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IBurnable {
    /**
     * @dev Throws if burned amount exceeds maximum allowed
     *
     * @param amount The maximum number of tokens that can be burned
     */
    error BurnableAmountExceeded(int64 amount);

    /**
     * @dev Emitted when the `amount` tokens are burned from TokenOwner
     *
     * @param burner The caller of the function that emitted the event
     * @param token Token address
     * @param amount The number of tokens to burn
     */
    event TokensBurned(address indexed burner, address indexed token, int64 amount);

    /**
     * @dev Returns the maximum number of tokens that can be burned from the treasury account
     */
    function getBurnableAmount() external view returns (int64);

    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(int64 amount) external returns (bool);
}
