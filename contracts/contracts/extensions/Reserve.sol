// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/IReserve.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import './Roles.sol';
import './TokenOwner.sol';

abstract contract Reserve is IReserve, TokenOwner, Roles {
    // The address of the internal reserve
    address internal _dataFeed;

    /**
     * @dev
     */
    modifier checkReserveIncrease(uint256 amount) {
        require(
            _checkReserve(amount, false),
            'Amount is bigger than current reserve'
        );
        _;
    }

    modifier checkReserveDecrease(uint256 amount) {
        require(
            _checkReserve(amount, true),
            'Amount is bigger than current reserve'
        );
        _;
    }

    function reserve_init(address dataFeed) internal {
        _dataFeed = dataFeed;
    }

    function _checkReserve(
        uint256 amount,
        bool less
    ) internal view returns (bool) {
        if (_dataFeed == address(0)) return true;
        uint256 currentReserve = getReserve();
        if (less) {
            return currentReserve >= amount;
        } else {
            return
                currentReserve >=
                (TokenOwner(_getTokenAddress()).totalSupply() + amount);
        }
    }

    function getReserve() internal view returns (uint256) {
        if (_dataFeed != address(0)) {
            (, int256 answer, , , ) = AggregatorV3Interface(_dataFeed)
                .latestRoundData();
            return uint256(answer);
        }
        return 0;
    }

    function updateDataFeed(
        address newAddress
    ) external onlyRole(_getRoleId(roleName.ADMIN)) {
        address previous = _dataFeed;
        _dataFeed = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }
}
