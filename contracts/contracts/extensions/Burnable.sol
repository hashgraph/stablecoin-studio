// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable-next-line max-line-length
import {HoldManagementStorageWrapper} from './HoldManagementStorageWrapper.sol';
import {Roles} from './Roles.sol';
import {IBurnable} from './Interfaces/IBurnable.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {BURNABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {TokenOwner} from './TokenOwner.sol';

contract Burnable is IBurnable, HoldManagementStorageWrapper, Roles, TokenOwner {

    /**
     * @dev Burns an `amount` of tokens owned by the treasury account
     *
     * @param amount The number of tokens to be burned
     */
    function burn(
        int64 amount
    )
        external
        override(IBurnable)
        onlyRole(_getRoleId(RoleName.BURN))
        amountIsNotNegative(amount, false)
        valueIsNotGreaterThan(SafeCast.toUint256(amount), _balanceOf(address(this)), true)
        isHoldActive
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        (int64 responseCode, ) = IHederaTokenService(_PRECOMPILED_ADDRESS).burnToken(
            currentTokenAddress,
            amount,
            new int64[](0)
        );

        bool success = _checkResponse(responseCode);

        emit TokensBurned(msg.sender, currentTokenAddress, amount);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BURNABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.burn.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBurnable).interfaceId;
    }
}
