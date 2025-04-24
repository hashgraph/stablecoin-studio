// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICustomFees} from './Interfaces/ICustomFees.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {_CUSTOM_FEES_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';


contract CustomFeesFacet is ICustomFees, IStaticFunctionSelectors, TokenOwnerStorageWrapper, RolesStorageWrapper {
    /**
     * @dev Updates the custom fees for the token
     *
     * @param fixedFees The fixed fees to be updated
     * @param fractionalFees The fractional fees to be updated
     */
    function updateTokenCustomFees(
        IHederaTokenService.FixedFee[] calldata fixedFees,
        IHederaTokenService.FractionalFee[] calldata fractionalFees
    ) external override(ICustomFees) onlyRole(_getRoleId(IRoles.RoleName.CUSTOM_FEES)) returns (bool) {
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

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CUSTOM_FEES_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.updateTokenCustomFees.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICustomFees).interfaceId;
    }
}
