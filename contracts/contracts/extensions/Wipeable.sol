// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IWipeable.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract Wipeable is IWipeable, TokenOwner, Roles {
    /**
     * @dev Operation to wipe a token amount (`amount`) from account (`account`).
     *
     * Validate that there is sufficient token balance before wipe.
     *
     * Only the 'WIPE ROLE` can execute
     * Emits a TokensWiped event
     *
     * @param account The address of the account where to wipe the token
     * @param amount The number of tokens to wipe
     */
    function wipe(
        address account,
        uint32 amount
    )
        external
        override(IWipeable)
        onlyRole(_getRoleId(RoleName.WIPE))
        checkAddressIsNotZero(account)
        returns (bool)
    {
        require(
            _balanceOf(account) >= amount,
            'Insufficient token balance for wiped'
        );

        address currentTokenAddress = _getTokenAddress();

        int256 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .wipeTokenAccount(currentTokenAddress, account, amount);

        bool success = _checkResponse(responseCode);

        emit TokensWiped(msg.sender, currentTokenAddress, account, amount);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
