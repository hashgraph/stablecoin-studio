// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IReserve} from './Interfaces/IReserve.sol';
import {
    AggregatorV3Interface
} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import {Roles} from './Roles.sol';
import {TokenOwner} from './TokenOwner.sol';

abstract contract Reserve is IReserve, TokenOwner, Roles {
    // The address of the reserve
    address private _reserveAddress;

    /**
     * @dev
     */
    modifier checkReserveIncrease(uint256 amount) {
        if (!_checkReserveAmount(amount, false))
            revert AmountBiggerThanReserve(amount);
        _;
    }

    modifier checkReserveDecrease(uint256 amount) {
        if (!_checkReserveAmount(amount, true))
            revert AmountBiggerThanReserve(amount);
        _;
    }

    function getReserveAmount()
        external
        view
        override(IReserve)
        returns (int256)
    {
        return _getReserveAmount();
    }

    function updateReserveAddress(
        address newAddress
    ) external override(IReserve) onlyRole(_getRoleId(RoleName.ADMIN)) {
        address previous = _reserveAddress;
        _reserveAddress = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }

    function getReserveAddress()
        external
        view
        override(IReserve)
        returns (address)
    {
        return _reserveAddress;
    }

    function __reserveInit(address dataFeed) internal onlyInitializing {
        _reserveAddress = dataFeed;
    }

    function _checkReserveAmount(
        uint256 amount,
        bool less
    ) private view returns (bool) {
        if (_reserveAddress == address(0)) return true;
        int256 reserveAmount = _getReserveAmount();
        assert(reserveAmount >= 0);
        uint256 currentReserve = uint(reserveAmount);
        uint8 reserveDecimals = AggregatorV3Interface(_reserveAddress)
            .decimals();
        uint8 tokenDecimals = _decimals();
        if (tokenDecimals > reserveDecimals) {
            if (amount % (10 ** (tokenDecimals - reserveDecimals)) != 0)
                revert FormatNumberIncorrect(amount);
            currentReserve =
                currentReserve *
                (10 ** (tokenDecimals - reserveDecimals));
        } else if (tokenDecimals < reserveDecimals) {
            amount = amount * (10 ** (reserveDecimals - tokenDecimals));
        }

        if (less) {
            return currentReserve >= amount;
        } else {
            return currentReserve >= _totalSupply() + amount;
        }
    }

    function _getReserveAmount() private view returns (int256) {
        if (_reserveAddress != address(0)) {
            (, int256 answer, , , ) = AggregatorV3Interface(_reserveAddress)
                .latestRoundData();
            return answer;
        }
        return 0;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
