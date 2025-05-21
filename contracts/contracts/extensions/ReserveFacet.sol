// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IReserve} from './Interfaces/IReserve.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {ReserveStorageWrapper} from './ReserveStorageWrapper.sol';
import {_RESERVE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract ReserveFacet is IReserve, IStaticFunctionSelectors, ReserveStorageWrapper {
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

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _RESERVE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.getReserveAmount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateReserveAddress.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getReserveAddress.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IReserve).interfaceId;
    }
}
