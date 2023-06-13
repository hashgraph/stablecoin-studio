// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    AggregatorV3Interface
} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

interface IHederaReserve is AggregatorV3Interface {
    /**
     * @dev Emitted when a new reserve is initialized
     *
     * @param initialReserve The initial reserve
     */
    event ReserveInitialized(int256 initialReserve);

    /**
     * @dev Emitted when HederaReserve contract admin has changed
     *
     * @param previousAdmin The previous admin
     * @param newAdmin The new admin
     */

    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);

    /**
     * @dev Emitted when the reserve amount has changed
     *
     * @param previousAmount The previous amount
     * @param newAmount The new amount
     */
    event AmountChanged(int256 previousAmount, int256 newAmount);

    /**
     * @dev Emitted when the provided `addr` is 0
     *
     * @param addr The address to check
     */
    error AddressZero(address addr);

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function setAmount(int256 newValue) external;

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(address admin) external;
}
