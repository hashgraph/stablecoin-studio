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
     * @dev Emitted when the updatedAt Threshold for the reserve is changed
     *
     * @param previousThreshold The previous updatedAt Threshold
     * @param newThreshold The new updatedAt Threshold
     */
    event UpdatedAtThresholdChanged(uint256 indexed previousThreshold, uint256 indexed newThreshold);

    /**
     * @dev Changes the current reserve address
     *
     * @param newAddress The new reserve address
     */
    function updateReserveAddress(address newAddress) external;

    /**
     * @dev Changes the current updatedAt threshold limit
     *
     * @param newThreshold The new updatedAt threshold
     */
    function updateUpdatedAtThreshold(uint256 newThreshold) external;

    /**
     * @dev Get the current reserve amount
     *
     */
    function getReserveAmount() external view returns (int256 amount, uint256 updatedAt);

    /**
     * @dev Gets the current reserve address
     *
     */
    function getReserveAddress() external view returns (address);

    /**
     * @dev Gets the current updatedAt threshold
     *
     */
    function getUpdatedAtThreshold() external view returns (uint256);
}
