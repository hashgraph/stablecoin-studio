// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IFreezable.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract Freezable is IFreezable, TokenOwner, Roles {
    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be freezed for the token
     */
    function freeze(
        address account
    )
        external
        override(IFreezable)
        onlyRole(_getRoleId(RoleName.FREEZE))
        addressIsNotZero(account)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .freezeToken(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit TransfersFrozen(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev Freezes transfers of the token for the `account`
     *
     * @param account The account whose transfers will be unfreezed for the token
     */
    function unfreeze(
        address account
    )
        external
        override(IFreezable)
        onlyRole(_getRoleId(RoleName.FREEZE))
        addressIsNotZero(account)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .unfreezeToken(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit TransfersUnfrozen(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
