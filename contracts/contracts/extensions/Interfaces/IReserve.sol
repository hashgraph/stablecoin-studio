// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IReserve {
    /**
     * @dev Emitted when the address for the reserve is changed
     *
     * @param previousAddress The previous reserve address
     * @param newAddress The new reserve address
     */
    event ReserveAddressChanged(address previousAddress, address newAddress);

    /**
     * @dev Changes the current reserve address
     *
     * @param newAddress The new reserve address
     */
    function updateReserveAddress(address newAddress) external;

    /**
     * @dev Get the current amount of reserve
     *
     */
    function getReserveAmount() external view returns (int256);

    /**
     * @dev Get the current address of reserve
     *
     */
    function getReserveAddress() external view returns (address);
}
