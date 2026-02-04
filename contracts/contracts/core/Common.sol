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
    modifier greaterThan(uint256 value, uint256 ref) {
        _greaterThan(value, ref);
        _;
    }

    /**
     * @dev Checks that value is not greater than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    modifier notGreaterThan(uint256 value, uint256 ref) {
        _notGreaterThan(value, ref);
        _;
    }

    /**
     * @dev Checks if an amount is greater than zero
     *
     * @param amount The value to check
     */
    modifier greaterThanZero(int256 amount) {
        _greaterThanZero(amount);
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

    modifier addressesAreNotZero(address[] calldata addrs) {
        for (uint256 i = 0; i < addrs.length; ) {
            _addressIsNotZero(addrs[i]);
            unchecked {
                i++;
            }
        }
        _;
    }

    modifier bytes32IsNotZero(bytes32 value) {
        _bytes32IsNotZero(value);
        _;
    }

    /**
     * @dev Checks if the calling account is the contract admin
     *
     */
    modifier isAdmin(address addr) {
        _checkIsAdmin(addr);
        _;
    }

    /**
     * @dev Checks that value is greater than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    function _greaterThan(uint256 value, uint256 ref) private pure {
        if (value <= ref) revert LessThan(value, ref);
    }

    /**
     * @dev Checks that value is not greater than ref
     *
     * @param value The value to check
     * @param ref The ref to compare with
     */
    function _notGreaterThan(uint256 value, uint256 ref) private pure {
        if (value > ref) revert GreaterThan(value, ref);
    }

    /**
     * @dev Checks if an amount is a negative number
     *
     * @param amount The value to check
     */
    function _greaterThanZero(int256 amount) private pure {
        if (amount <= 0) revert NegativeAmount(amount);
    }

    /**
     * @dev Checks if an address equals to zero address
     *
     * @param addr The address to check
     */
    function _addressIsNotZero(address addr) private pure {
        if (addr == address(0)) revert AddressZero(addr);
    }

    function _bytes32IsNotZero(bytes32 value) private pure {
        if (value == bytes32(0)) revert Bytes32Zero(value);
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

    /**
     * @dev Reverts if the caller is not the specified admin
     * @param admin The address of the admin to check against
     */
    function _checkIsAdmin(address admin) internal view {
        if (admin != msg.sender) revert OnlyAdmin(msg.sender);
    }
}
