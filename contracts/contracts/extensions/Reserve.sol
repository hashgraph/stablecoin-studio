// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/IReserve.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import './Roles.sol';
import './TokenOwner.sol';

abstract contract Reserve is IReserve, TokenOwner, Roles {
    // The address of the internal reserve
    address internal _reserveAddress;

    /**
     * @dev
     */
    modifier checkReserveIncrease(uint256 amount) {
        require(
            _checkReserveAmount(amount, false),
            'Amount is bigger than current reserve'
        );
        _;
    }

    modifier checkReserveDecrease(uint256 amount) {
        require(
            _checkReserveAmount(amount, true),
            'Amount is bigger than current reserve'
        );
        _;
    }

    function reserve_init(address dataFeed) internal onlyInitializing {
        _reserveAddress = dataFeed;
    }

    function _checkReserveAmount(
        uint256 amount,
        bool less
    ) internal view returns (bool) {
        if (_reserveAddress == address(0)) return true;
        int256 reserveAmount = _getReserveAmount();
        assert(reserveAmount >= 0);
        uint256 currentReserve = uint(reserveAmount);
        uint8 reserveDecimals = AggregatorV3Interface(_reserveAddress)
            .decimals();
        uint8 tokenDecimals = _decimals();
        if (tokenDecimals > reserveDecimals) {
            require(
                amount % (10 ** (tokenDecimals - reserveDecimals)) == 0,
                'Format number incorrect'
            );
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

    function getReserveAmount() external override(IReserve) view returns (int256) {
        return _getReserveAmount();
    }

    function _getReserveAmount() internal view returns (int256) {
        if (_reserveAddress != address(0)) {
            (, int256 answer, , , ) = AggregatorV3Interface(_reserveAddress)
                .latestRoundData();
            return answer;
        }
        return 0;
    }

    function updateReserveAddress(
        address newAddress
    ) external override(IReserve)
    onlyRole(_getRoleId(roleName.ADMIN)) {
        address previous = _reserveAddress;
        _reserveAddress = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }

    function getReserveAddress() external override(IReserve) view returns (address) {
        return _reserveAddress;
    }
}
