// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {IWipeable} from './Interfaces/IWipeable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_WIPEABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract WipeableFacet is IWipeable, IStaticFunctionSelectors, TokenOwnerStorageWrapper, RolesStorageWrapper {
    /**
     * @dev Operation to wipe a token amount (`amount`) from account (`account`).
     *
     * Validate that there is sufficient token balance before wipe.
     *
     * Only the 'WIPE ROLE` can execute
     * Emits a TokensWiped event
     *
     * @param account The address of the account where to wipe the token
     * @param amount The number of tokens to wipe
     */
    function wipe(
        address account,
        int64 amount
    )
        external
        override(IWipeable)
        onlyRole(_getRoleId(IRoles.RoleName.WIPE))
        addressIsNotZero(account)
        amountIsNotNegative(amount, false)
        valueIsNotGreaterThan(SafeCast.toUint256(amount), _balanceOf(account), true)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).wipeTokenAccount(
            currentTokenAddress,
            account,
            amount
        );

        bool success = _checkResponse(responseCode);

        emit TokensWiped(msg.sender, currentTokenAddress, account, amount);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _WIPEABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.wipe.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IWipeable).interfaceId;
    }
}
