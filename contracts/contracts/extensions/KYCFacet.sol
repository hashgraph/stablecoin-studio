// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IKYC} from './Interfaces/IKYC.sol';
import {_KYC_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {_KYC_ROLE} from '../constants/roles.sol';

contract KYCFacet is IKYC, IStaticFunctionSelectors, TokenOwnerStorageWrapper, RolesStorageWrapper {
    /**
     * @dev Grants KYC to account for the token
     *
     * @param account The account to which the KYC will be granted
     */
    function grantKyc(
        address account
    ) external override(IKYC) onlyRole(_KYC_ROLE) addressIsNotZero(account) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).grantTokenKyc(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit GrantTokenKyc(currentTokenAddress, account);

        return success;
    }

    /**
     * @dev Revokes KYC to account for the token
     *
     * @param account The account to which the KYC will be revoked
     */
    function revokeKyc(address account) external onlyRole(_KYC_ROLE) addressIsNotZero(account) returns (bool) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).revokeTokenKyc(currentTokenAddress, account);

        bool success = _checkResponse(responseCode);

        emit RevokeTokenKyc(currentTokenAddress, account);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KYC_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.grantKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeKyc.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IKYC).interfaceId;
    }
}
