// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

interface IHederaReserve is AggregatorV3Interface {

    event ReserveInitialized(uint256 initialReserve);

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function set(uint256 newValue) external;

}
