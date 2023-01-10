// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/IHederaReserve.sol';

contract HederaReserve is IHederaReserve {
    uint8 private _decimals = 2;
    uint256 private _reserve;
    uint80 private _cRoundId = 0;

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     * @param initialReserve The initial amount to be on the reserve
     */
    function initialize(uint256 initialReserve) external {
        _reserve = initialReserve;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function set(uint256 newValue) external {
        _reserve = newValue;
    }

    /**
     *  @dev Decimals of the reserve
     *
     *  @return The decimals
     */
    function decimals() external view returns (uint8) {
        return _decimals;
    }

    /**
     *  @dev Description of the reserve
     *
     *  @return The description
     */
    function description() external view returns (string memory) {
        return 'Example Hedera Reserve for ChainLink';
    }

    /**
     *  @dev Version of the reserve
     *
     *  @return The current version
     */
    function version() external view returns (uint256) {
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
     *
     *  @param _roundId The round to get the value from
     */
    function getRoundData(
        uint80 _roundId
    )
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _roundId,
            int(_reserve),
            block.timestamp,
            block.timestamp,
            _roundId
        );
    }

    /**
     *  @dev Returns the latest round data
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (
            _cRoundId,
            int(_reserve),
            block.timestamp,
            block.timestamp,
            _cRoundId
        );
    }
}
