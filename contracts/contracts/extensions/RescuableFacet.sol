// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {IRescuable} from './Interfaces/IRescuable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {ReentrancyGuardTransient} from '@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_RESCUABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {_RESCUE_ROLE} from '../constants/roles.sol';

contract RescuableFacet is
    ReentrancyGuardTransient,
    IRescuable,
    IStaticFunctionSelectors,
    TokenOwnerStorageWrapper,
    RolesStorageWrapper
{
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
        onlyRole(_RESCUE_ROLE)
        greaterThanZero(amount)
        notGreaterThan(SafeCast.toUint256(amount), _balanceOf(address(this)))
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
        onlyRole(_RESCUE_ROLE)
        notGreaterThan(amount, address(this).balance)
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
