// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IFreezable {
    /**
     * @dev Emitted when freezing transfers of the token for the `account`
     *
     * @param account Token address
     * @param account Account address
     */
    event TransfersFrozen(address token, address account);

    /**
     * @dev Emitted when unfreezing transfers of the token for the `account`
     *
     * @param account Token address
     * @param account Account address
     */
    event TransfersUnfrozen(address token, address account);

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be freezed for the token
     */
    function freeze(address account) external returns (bool);

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be unfreezed for the token
     */
    function unfreeze(address account) external returns (bool);
}
