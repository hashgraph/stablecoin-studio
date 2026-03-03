// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IReserveStorageWrapper {
    /**
     * @dev Emitted when the provided `amount` is bigger than the current reserve
     *
     * @param amount The value to check
     */
    error AmountBiggerThanReserve(uint256 amount);

    /**
     * @dev Emitted when the provided `amount` has an invalid format
     *
     * @param amount The value to check
     */
    error FormatNumberIncorrect(uint256 amount);

    /**
     * @dev Emitted when the provided reserve `amount` is too old
     *
     * @param updatedAt The updated At value for the reserve amount
     * @param updatedAtThreshold The updated At Threshold value for the reserve amount

     */
    error ReserveAmountOutdated(uint256 updatedAt, uint256 updatedAtThreshold);
}
