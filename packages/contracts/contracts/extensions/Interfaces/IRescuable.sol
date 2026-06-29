// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IRescuable {
    /**
     * @dev Emitted when `value` tokens are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     *
     * @param rescuer The caller of the function that emitted the event
     * @param tokenId The token that was rescuedp
     * @param amount The amount of the token that was rescued
     */
    event TokenRescued(address indexed rescuer, address indexed tokenId, int64 amount);

    /**
     * @dev Emitted when `value` HBARs are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     *
     * @param rescuer The caller of the function that emitted the event
     * @param amount The amount of the token that was rescued
     */
    event HBARRescued(address indexed rescuer, uint256 amount);

    /**
     * @dev Emitted when rescuing HBAR did not work
     *
     * @param amount The amount of HBAR to rescue
     *
     */
    error HBARRescueError(uint256 amount);

    /**
     * @dev Emitted when the requested rescue amount exceeds the unreserved contract
     * balance (the contract balance minus the amount held in escrow on token holders'
     * behalf).
     *
     * @param rescuableAmount The maximum amount of tokens that can be rescued
     */
    error RescuableAmountExceeded(int64 rescuableAmount);

    /**
     * @dev Rescues `value` tokens from contractTokenOwner to rescuer
     *
     * @param amount The number of tokens to rescuer
     */
    function rescue(int64 amount) external returns (bool);

    /**
     * @dev Rescues `value` HBAR from contractTokenOwner to rescuer
     *
     * @param amount The number of tokens to rescuer
     */
    function rescueHBAR(uint256 amount) external returns (bool);

    /**
     * @dev Returns the amount of tokens that can be rescued from the contract, i.e. the
     * contract balance minus the amount held in escrow on token holders' behalf.
     *
     * @return amount_ The maximum amount of tokens that can be rescued
     */
    function getRescuableAmount() external view returns (int64 amount_);
}
