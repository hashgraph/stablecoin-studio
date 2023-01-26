// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IPausable {
    /**
     * @dev Emitted when the token is paused
     *
     * @param token Token address
     */
    event TokenPaused(address token);

    /**
     * @dev Emitted when the token is unpaused
     *
     * @param token Token address
     */
    event TokenUnpaused(address token);

    /**
     * @dev Pauses the token in order to prevent it from being involved in any kind of operation
     *
     */
    function pause() external returns (bool);

    /**
     * @dev Unpauses the token in order to allow it to be involved in any kind of operation
     *
     */
    function unpause() external returns (bool);
}
