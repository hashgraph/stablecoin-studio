// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICustomFees} from './Interfaces/ICustomFees.sol';
import {Roles} from './Roles.sol';
import {TokenOwner} from './TokenOwner.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';

abstract contract CustomFees is ICustomFees, TokenOwner, Roles {
    /**
     * @dev Updates the custom fees for the token
     *
     * @param fixedFees The fixed fees to be updated
     * @param fractionalFees The fractional fees to be updated
     */
    function updateTokenCustomFees(
        IHederaTokenService.FixedFee[] calldata fixedFees,
        IHederaTokenService.FractionalFee[] calldata fractionalFees
    ) external override(ICustomFees) onlyRole(_getRoleId(RoleName.CUSTOM_FEES)) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).updateFungibleTokenCustomFees(
            currentTokenAddress,
            fixedFees,
            fractionalFees
        );

        bool success = _checkResponse(responseCode);

        emit TokenCustomFeesUpdated(msg.sender, currentTokenAddress);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
