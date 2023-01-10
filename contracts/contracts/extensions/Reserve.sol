// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/IReserve.sol';

abstract contract Reserve is IReserve {
    // The address of the internal reserve
    address internal _reserve;

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

    function _checkReserve(uint256 amount, bool less) internal view returns (bool) {
        uint256 currentReserve = getReserve();
        if (less) {
            return currentReserve >= amount;
        } else {
            uint256 totalSupply = 0; // TODO
            return currentReserve >= (totalSupply + amount);
        }
    }

    function getReserve() internal view returns (uint256) {
        return 0;
    }

    function updateReserve(address newAddress) external {
        address previous = _reserve;
        _reserve = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }
}
