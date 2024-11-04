// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface ICustomFees {
    struct FixedFeeStruct {
        int64 amount;
        address tokenId;
        bool useHbarsForPayment;
        bool useCurrentTokenForPayment;
        address feeCollector;
    }

    struct FractionalFeeStruct {
        int64 numerator;
        int64 denominator;
        int64 minimumAmount;
        int64 maximumAmount;
        bool netOfTransfers;
        address feeCollector;
    }

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
        FixedFeeStruct[] calldata fixedFees,
        FractionalFeeStruct[] calldata fractionalFees
    ) external;
}
