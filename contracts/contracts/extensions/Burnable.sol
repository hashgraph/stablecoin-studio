// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBurnable} from './Interfaces/IBurnable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {HoldManagement} from './HoldManagement.sol';

abstract contract Burnable is IBurnable, HoldManagement {
    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(
        int64 amount
    )
        external
        override(IBurnable)
        onlyRole(_getRoleId(RoleName.BURN))
        amountIsNotNegative(amount, false)
        valueIsNotGreaterThan(SafeCast.toUint256(amount), _balanceOf(address(this)), true)
        isHoldActive
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        (int64 responseCode, ) = IHederaTokenService(_PRECOMPILED_ADDRESS).burnToken(
            currentTokenAddress,
            amount,
            new int64[](0)
        );

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
