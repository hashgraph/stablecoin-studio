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

        address currentTokenAddress = _getTokenAddress();

        (int256 responseCode, ) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .burnToken(currentTokenAddress, uint64(amount), new int64[](0));

        bool success = _checkResponse(responseCode);

        emit TokensBurned(msg.sender, currentTokenAddress, amount);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
