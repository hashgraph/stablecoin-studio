// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

interface IHederaReserve is AggregatorV3Interface {

    event ReserveInitialized(int256 initialReserve);


    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(int256 initialReserve) external;

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function set(int256 newValue) external;
}
