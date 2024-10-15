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
     * @dev Checks if the current reserve is enough for a certain amount of tokens
     *      comparing with the sum of amount plus total supply
     *
     * @param amount The amount to check
     */
    modifier checkReserveIncrease(uint256 amount) {
        if (!_checkReserveAmount(amount, false))
            revert AmountBiggerThanReserve(amount);
        _;
    }

    /**
     * @dev Gets the current reserve amount
     *
     */
    function getReserveAmount()
        external
        view
        override(IReserve)
        returns (int256)
    {
        return _getReserveAmount();
    }

    /**
     * @dev Updates de reserve address
     *
     * @param newAddress The new reserve address. Can be set to 0.0.0 (zero address) to disable the reserve.
     */
    function updateReserveAddress(
        address newAddress
    ) external override(IReserve) onlyRole(_getRoleId(RoleName.ADMIN)) {
        address previous = _reserveAddress;
        _reserveAddress = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }

    /**
     * @dev Gets the current reserve address
     *
     */
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

    /**
     * @dev Checks if the current reserve is enough for a certain amount of tokens
     *
     * @param amount The amount to check
     * @param less Flag that indicates if current reserve is not less than the amount or
     *             than the sum of amount plus total supply
     */
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
        uint256 totalSupply = _totalSupply();
        if (tokenDecimals > reserveDecimals) {
            if (amount % (10 ** (tokenDecimals - reserveDecimals)) != 0)
                revert FormatNumberIncorrect(amount);
            currentReserve =
                currentReserve *
                (10 ** (tokenDecimals - reserveDecimals));
        } else if (tokenDecimals < reserveDecimals) {
            amount = amount * (10 ** (reserveDecimals - tokenDecimals));
            totalSupply =
                totalSupply *
                (10 ** (reserveDecimals - tokenDecimals));
        }

        if (less) {
            return currentReserve >= amount;
        } else {
            return currentReserve >= totalSupply + amount;
        }
    }

    /**
     * @dev Gets the current reserve amount
     *
     */
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
