// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {Initializable} from './Initializable.sol';
import {ICommon} from './ICommon.sol';
import {HederaResponseCodes} from '@hashgraph/smart-contracts/contracts/system-contracts/HederaResponseCodes.sol';

abstract contract Common is Initializable, ICommon {
    /**
     * @dev Checks that value is not less than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    modifier valueIsNotLessThan(uint256 value, uint256 ref, bool equalAccepted) {
        _valueIsNotLessThan(value, ref, equalAccepted);
        _;
    }

    /**
     * @dev Checks that value is not greater than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    modifier valueIsNotGreaterThan(uint256 value, uint256 ref, bool equalAccepted) {
        _valueIsNotGreaterThan(value, ref, equalAccepted);
        _;
    }

    /**
     * @dev Checks if an amount is a negative number
     *
     * @param amount The value to check
     * @param zeroAccepted A flag that indicates if zero value is accepted or not
     */
    modifier amountIsNotNegative(int256 amount, bool zeroAccepted) {
        _amountIsNotNegative(amount, zeroAccepted);
        _;
    }

    /**
     * @dev Checks if an address equals to zero address
     *
     * @param addr The address to check
     */
    modifier addressIsNotZero(address addr) {
        _addressIsNotZero(addr);
        _;
    }

    /**
     * @dev Checks that value is not less than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    function _valueIsNotLessThan(uint256 value, uint256 ref, bool equalAccepted) private pure {
        if (equalAccepted ? value < ref : value <= ref) revert LessThan(value, ref);
    }

    /**
     * @dev Checks that value is not greater than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    function _valueIsNotGreaterThan(uint256 value, uint256 ref, bool equalAccepted) private pure {
        if (equalAccepted ? value > ref : value >= ref) revert GreaterThan(value, ref);
    }

    /**
     * @dev Checks if an amount is a negative number
     *
     * @param amount The value to check
     * @param zeroAccepted A flag that indicates if zero value is accepted or not
     */
    function _amountIsNotNegative(int256 amount, bool zeroAccepted) private pure {
        if (zeroAccepted ? amount < 0 : amount <= 0) revert NegativeAmount(amount);
    }

    /**
     * @dev Checks if an address equals to zero address
     *
     * @param addr The address to check
     */
    function _addressIsNotZero(address addr) private pure {
        if (addr == address(0)) revert AddressZero(addr);
    }

    /**
     * @dev Transforms the response from a HederaResponseCodes to a boolean
     *
     * @param responseCode The Hedera response code to transform
     */
    function _checkResponse(int64 responseCode) internal pure returns (bool) {
        if (responseCode != HederaResponseCodes.SUCCESS) revert ResponseCodeInvalid(responseCode);
        return true;
    }
}
