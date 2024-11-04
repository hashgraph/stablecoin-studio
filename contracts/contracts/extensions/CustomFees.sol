// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ICustomFees} from './Interfaces/ICustomFees.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';

abstract contract CustomFees is ICustomFees {
    /* solhint-disable no-empty-blocks */
    function updateTokenCustomFees(
        IHederaTokenService.FixedFee[] calldata fixedFees,
        IHederaTokenService.FractionalFee[] calldata fractionalFees
    ) external {
        // TODO: implement
    }
    /* solhint-enable no-empty-blocks */

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
