// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable-next-line max-line-length
import {HoldManagementStorageWrapper} from './HoldManagementStorageWrapper.sol';
import {IBurnable} from './Interfaces/IBurnable.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_BURNABLE_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {RolesStorageWrapper} from './RolesStorageWrapper.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {_BURN_ROLE} from '../constants/roles.sol';

contract BurnableFacet is
    IBurnable,
    IStaticFunctionSelectors,
    HoldManagementStorageWrapper,
    RolesStorageWrapper,
    TokenOwnerStorageWrapper
{
    modifier checkBurnAmount(int64 _amount) {
        int64 burnableAmount = getBurnableAmount();
        if (burnableAmount < _amount) {
            revert BurnableAmountExceeded(burnableAmount);
        }
        _;
    }

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
        onlyRole(_BURN_ROLE)
        amountIsNotNegative(amount, false)
        checkBurnAmount(amount)
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

    function getBurnableAmount() public view returns (int64 amount_) {
        amount_ = SafeCast.toInt64(SafeCast.toInt256(_balanceOf(address(this)))) - _holdDataStorage().totalHeldAmount;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BURNABLE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.burn.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getBurnableAmount.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBurnable).interfaceId;
    }
}
