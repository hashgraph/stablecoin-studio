// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IDeletable {
    /**
     * @dev Emitted when the token is deleted
     *
     * @param token Token address
     */
    event TokenDeleted(address indexed token);

    /**
     * @dev Deletes the token
     *
     */
    function deleteToken() external returns (bool);
}
