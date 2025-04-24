// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {IRescuable} from './Interfaces/IRescuable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/security/ReentrancyGuard.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_RESCUABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract RescuableFacet is ReentrancyGuard, IRescuable, TokenOwnerStorageWrapper, RolesStorageWrapper {
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
        valueIsNotGreaterThan(SafeCast.toUint256(amount), _balanceOf(address(this)), true)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
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

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _RESCUABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.rescue.selector;
        staticFunctionSelectors_[selectorIndex++] = this.rescueHBAR.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IRescuable).interfaceId;
    }
}
