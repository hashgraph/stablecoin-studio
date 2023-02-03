// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

interface IUpgradeTestContract is AggregatorV3Interface {
    event ReserveInitialized(int256 initialReserve);

    event AdminChanged(address previousAdmin, address newAdmin);

    event AmountChanged(int256 previousAmount, int256 newAmount);

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    //function setAmount(int256 newValue) external;

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    //function setAdmin(address admin) external;
}
