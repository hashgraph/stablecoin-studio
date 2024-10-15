// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IReserve {
    /**
     * @dev Emitted when the address for the reserve is changed
     *
     * @param previousAddress The previous reserve address
     * @param newAddress The new reserve address
     */
    event ReserveAddressChanged(
        address indexed previousAddress,
        address indexed newAddress
    );

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
     * @dev Changes the current reserve address
     *
     * @param newAddress The new reserve address
     */
    function updateReserveAddress(address newAddress) external;

    /**
     * @dev Get the current reserve amount
     *
     */
    function getReserveAmount() external view returns (int256);

    /**
     * @dev Gets the current reserve address
     *
     */
    function getReserveAddress() external view returns (address);
}
