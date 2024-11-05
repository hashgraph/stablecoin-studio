// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
interface ICustomFees {
    /**
     * @dev Emitted when token custom fees are updated
     *
     * @param token Token address
     */
    event TokenCustomFeesUpdated(address indexed token);

    /**
     * @dev Update custom fees for the token
     *
     * @param fixedFees The fixed fees to be added
     * @param fractionalFees The fractional fees to be added
     */
    function updateTokenCustomFees(
        IHederaTokenService.FixedFee[] calldata fixedFees,
        IHederaTokenService.FractionalFee[] calldata fractionalFees
    ) external returns (bool);
}
