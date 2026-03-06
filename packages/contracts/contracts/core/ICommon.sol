// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface ICommon {
    /**
     * @dev Emitted when the calling account is not the admin
     *
     * @param account The address that tried to change the reserve
     */
    error OnlyAdmin(address account);

    /**
     * @dev Emitted when the provided `amount` is less than 0
     *
     * @param amount The value to check
     */
    error NegativeAmount(int256 amount);

    /**
     * @dev Emitted when the provided `addr` is 0
     *
     * @param addr The address to check
     */
    error AddressZero(address addr);

    error Bytes32Zero(bytes32 value);

    /**
     * @dev Emitted when the provided `code` is not success
     *
     * @param code The code to check
     */
    error ResponseCodeInvalid(int64 code);

    /**
     * @dev Emitted when the provided `value` is not greater than `ref`
     *
     * @param value The value to check
     * @param ref The reference value
     */
    error GreaterThan(uint256 value, uint256 ref);

    /**
     * @dev Emitted when the provided `value` is not less than `ref`
     *
     * @param value The value to check
     * @param ref The reference value
     */
    error LessThan(uint256 value, uint256 ref);
}
