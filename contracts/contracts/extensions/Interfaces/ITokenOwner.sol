// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface ITokenOwner {
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

    /**
     * @dev Emitted when the provided `code` is not success
     *
     * @param code The code to check
     */
    error ResponseCodeInvalid(int256 code);

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

    /**
     * @dev Returns the token address
     *
     * @return address The token address
     */
    function getTokenAddress() external view returns (address);
}
