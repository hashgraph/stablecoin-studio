// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
interface ICustomFees {
    /**
     * @dev Emitted when token custom fees are updated
     *
     * @param sender The caller of the function that emitted the event
     * @param token Token address
     * @param fixedFees The fixed fees to be updated
     * @param fractionalFees The fractional fees to be updated
     */
    event TokenCustomFeesUpdated(
        address sender,
        address indexed token,
        IHederaTokenService.FixedFee[] fixedFees,
        IHederaTokenService.FractionalFee[] fractionalFees
    );
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
