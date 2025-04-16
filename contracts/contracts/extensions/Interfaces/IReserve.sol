// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IReserve {
    /**
     * @dev Emitted when the address for the reserve is changed
     *
     * @param previousAddress The previous reserve address
     * @param newAddress The new reserve address
     */
    event ReserveAddressChanged(address indexed previousAddress, address indexed newAddress);

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
