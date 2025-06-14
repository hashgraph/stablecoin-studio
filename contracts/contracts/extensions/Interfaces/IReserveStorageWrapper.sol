// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

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
}
