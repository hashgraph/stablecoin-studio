// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IReserve} from './Interfaces/IReserve.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {ReserveStorageWrapper} from './ReserveStorageWrapper.sol';

abstract contract Reserve is IReserve, ReserveStorageWrapper {
    /**
     * @dev Gets the current reserve amount
     *
     */
    function getReserveAmount() external view override(IReserve) returns (int256) {
        return _getReserveAmount();
    }

    /**
     * @dev Updates de reserve address
     *
     * @param newAddress The new reserve address. Can be set to 0.0.0 (zero address) to disable the reserve.
     */
    function updateReserveAddress(
        address newAddress
    ) external override(IReserve) onlyRole(_getRoleId(IRoles.RoleName.ADMIN)) {
        address previous = _reserveStorage().reserveAddress;
        _reserveStorage().reserveAddress = newAddress;
        emit ReserveAddressChanged(previous, newAddress);
    }

    /**
     * @dev Gets the current reserve address
     *
     */
    function getReserveAddress() external view override(IReserve) returns (address) {
        return _reserveStorage().reserveAddress;
    }
}
