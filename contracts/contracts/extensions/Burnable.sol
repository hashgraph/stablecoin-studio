// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/IBurnable.sol';
import './TokenOwner.sol';
import './Roles.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract Burnable is IBurnable, TokenOwner, Roles {
    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(
        uint256 amount
    )
        external
        override(IBurnable)
        onlyRole(_getRoleId(RoleName.BURN))
        returns (bool)
    {
        require(
            _balanceOf(address(this)) >= amount,
            'Amount is greater than treasury account balance'
        );

        emit TokensBurned(msg.sender, _getTokenAddress(), amount);

        (int256 responseCode, ) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .burnToken(_getTokenAddress(), uint64(amount), new int64[](0));

        bool success = _checkResponse(responseCode);

        return success;
    }
}
