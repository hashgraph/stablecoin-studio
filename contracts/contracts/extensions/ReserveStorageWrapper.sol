// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IReserveStorageWrapper} from './Interfaces/IReserveStorageWrapper.sol';
import {AggregatorV3Interface} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {_RESERVE_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract ReserveStorageWrapper is IReserveStorageWrapper, TokenOwnerStorageWrapper, RolesStorageWrapper {
    struct ReserveStorage {
        address reserveAddress;
    }

    /**
     * @dev Checks if the current reserve is enough for a certain amount of tokens
     *      comparing with the sum of amount plus total supply
     *
     * @param amount The amount to check
     */
    modifier checkReserveIncrease(uint256 amount) {
        if (!_checkReserveAmount(amount)) revert AmountBiggerThanReserve(amount);
        _;
    }

    function __reserveInit(address dataFeed) internal {
        _reserveStorage().reserveAddress = dataFeed;
    }

    /**
     * @dev Checks if the current reserve is enough for a certain amount of tokens
     *
     * @param amount The amount to check
     */
    function _checkReserveAmount(uint256 amount) private view returns (bool) {
        address reserveAddress = _reserveStorage().reserveAddress;
        if (reserveAddress == address(0)) return true;
        int256 reserveAmount = _getReserveAmount();
        assert(reserveAmount >= 0);
        uint256 currentReserve = uint256(reserveAmount);
        uint8 reserveDecimals = AggregatorV3Interface(reserveAddress).decimals();
        uint8 tokenDecimals = _decimals();
        uint256 totalSupply = _totalSupply();
        if (tokenDecimals > reserveDecimals) {
            if (amount % (10 ** (tokenDecimals - reserveDecimals)) != 0) revert FormatNumberIncorrect(amount);
            currentReserve = currentReserve * (10 ** (tokenDecimals - reserveDecimals));
        } else if (tokenDecimals < reserveDecimals) {
            amount = amount * (10 ** (reserveDecimals - tokenDecimals));
            totalSupply = totalSupply * (10 ** (reserveDecimals - tokenDecimals));
        }

        return currentReserve >= totalSupply + amount;
    }

    /**
     * @dev Gets the current reserve amount
     *
     */
    function _getReserveAmount() internal view returns (int256) {
        address reserveAddress = _reserveStorage().reserveAddress;
        if (reserveAddress != address(0)) {
            (, int256 answer, , , ) = AggregatorV3Interface(reserveAddress).latestRoundData();
            return answer;
        }
        return 0;
    }

    function _reserveStorage() internal pure returns (ReserveStorage storage reserveStorage_) {
        bytes32 position = _RESERVE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            reserveStorage_.slot := position
        }
    }
}
