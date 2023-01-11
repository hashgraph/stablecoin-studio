// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/IHederaReserve.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract HederaReserve is IHederaReserve, Initializable {
    uint8 private constant _decimals = 2;
    uint80 private constant _cRoundId = 0;
    int256 private _reserve;
    address private _admin;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can change the reserve'
        );
        _;
    }

    /**
     *  @dev Initializes the reserve with the initial amount
     *
     *  @param initialReserve The initial amount to be on the reserve
     */
    function initialize(int256 initialReserve, address admin)
        external
        initializer
    {
        _reserve = initialReserve;
        _admin = admin;
        emit ReserveInitialized(initialReserve);
    }

    /**
     *  @dev Sets a new reserve amount
     *
     *  @param newValue The new value of the reserve
     */
    function set(int256 newValue) external isAdmin {
        _reserve = newValue;
    }

    /**
     *  @dev Sets a new admin address
     *
     *  @param admin The new admin
     */
    function setAdmin(address admin) external isAdmin {
        _admin = admin;
    }

    /**
     *  @dev Decimals of the reserve
     *
     *  @return The decimals
     */
    function decimals() external pure returns (uint8) {
        return _decimals;
    }

    /**
     *  @dev Description of the reserve
     *
     *  @return The description
     */
    function description() external pure returns (string memory) {
        return 'Example Hedera Reserve for ChainLink';
    }

    /**
     *  @dev Version of the reserve
     *
     *  @return The current version
     */
    function version() external pure returns (uint256) {
        return 1;
    }

    /**
     *  @dev Gets a value from a specific round
     *
     *  @param _roundId The round to get the value from
     */
    function getRoundData(uint80 _roundId)
        external
        pure
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        revert('Not implemented');
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
            _reserve,
            block.timestamp,
            block.timestamp,
            _cRoundId
        );
    }
}
