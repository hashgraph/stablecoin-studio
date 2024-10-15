// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {TokenOwner} from './TokenOwner.sol';
import {Roles} from './Roles.sol';
import {IRescuable} from './Interfaces/IRescuable.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import {
    ReentrancyGuard
} from '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';

abstract contract Rescuable is ReentrancyGuard, IRescuable, TokenOwner, Roles {
    /**
     * @dev Rescues `value` `tokenId` from contractTokenOwner to rescuer
     *
     * Must be protected with isRescuer()
     *
     * @param amount The number of tokens to rescuer
     */
    function rescue(
        int64 amount
    )
        external
        override(IRescuable)
        onlyRole(_getRoleId(RoleName.RESCUE))
        amountIsNotNegative(amount, false)
        valueIsNotGreaterThan(
            SafeCast.toUint256(amount),
            _balanceOf(address(this)),
            true
        )
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .transferToken(
                currentTokenAddress,
                address(this),
                msg.sender,
                amount
            );

        bool success = _checkResponse(responseCode);

        emit TokenRescued(msg.sender, currentTokenAddress, amount);

        return success;
    }

    /**
     * @dev Rescues `value` HBAR from contractTokenOwner to rescuer
     *
     * Must be protected with isRescuer()
     *
     * @param amount The number of HBAR to rescuer
     */
    function rescueHBAR(
        uint256 amount
    )
        external
        override(IRescuable)
        onlyRole(_getRoleId(RoleName.RESCUE))
        valueIsNotGreaterThan(amount, address(this).balance, true)
        nonReentrant
        returns (bool)
    {
        (bool sent, ) = msg.sender.call{value: amount}('');
        if (!sent) revert HBARRescueError(amount);

        emit HBARRescued(msg.sender, amount);

        return sent;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
