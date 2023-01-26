// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IRescatable {
    /**
     * @dev Emitted when `value` tokens are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     *
     * @param rescuer The caller of the function that emitted the event
     * @param tokenId The token that was rescued
     * @param amount The amount of the token that was rescued
     */
    event TokenRescued(address rescuer, address tokenId, uint256 amount);

    /**
     * @dev Rescue `value` tokens from contractTokenOwner to rescuer
     *
     * @param amount The number of tokens to rescuer
     */
    function rescue(uint256 amount) external returns (bool);
}
