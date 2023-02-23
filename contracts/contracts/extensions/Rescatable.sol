// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './TokenOwner.sol';
import './Roles.sol';
import './Interfaces/IRescatable.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract Rescatable is IRescatable, TokenOwner, Roles {
    /**
     * @dev Rescue `value` `tokenId` from contractTokenOwner to rescuer
     *
     * Must be protected with isRescuer()
     *
     * @param amount The number of tokens to rescuer
     */
    function rescue(
        int64 amount
    )
        external
        override(IRescatable)
        onlyRole(_getRoleId(RoleName.RESCUE))
        isNotNegative(amount)
        returns (bool)
    {
        require(
            _balanceOf(address(this)) >= uint256(uint64(amount)),
            'Amount must not exceed the token balance'
        );

        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .transferToken(
                currentTokenAddress,
                address(this),
                msg.sender,
                int64(int256(amount))
            );

        bool success = _checkResponse(responseCode);

        emit TokenRescued(msg.sender, currentTokenAddress, amount);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
