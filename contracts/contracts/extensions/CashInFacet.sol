// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ICashIn} from './Interfaces/ICashIn.sol';
import {IRoles} from './Interfaces/IRoles.sol';
import {SupplierAdminStorageWrapper} from './SupplierAdminStorageWrapper.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {ReserveStorageWrapper} from './ReserveStorageWrapper.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_CASH_IN_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from '../resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract CashInFacet is ICashIn, IStaticFunctionSelectors, SupplierAdminStorageWrapper, ReserveStorageWrapper {
    /**
     * @dev Creates an `amount` of tokens and transfers them to an `account`, increasing
     * the total supply
     *
     * @param account The address that receives minted tokens
     * @param amount The number of tokens to be minted
     */
    function mint(
        address account,
        int64 amount
    )
        external
        override(ICashIn)
        onlyRole(_getRoleId(IRoles.RoleName.CASHIN))
        checkReserveIncrease(SafeCast.toUint256(amount))
        addressIsNotZero(account)
        amountIsNotNegative(amount, false)
        returns (bool)
    {
        if (!_supplierAdminStorage().unlimitedSupplierAllowances[msg.sender])
            _decreaseSupplierAllowance(msg.sender, SafeCast.toUint256(amount));

        address currentTokenAddress = _getTokenAddress();

        uint256 balance = _balanceOf(address(this));

        (int64 responseCode, , ) = IHederaTokenService(_PRECOMPILED_ADDRESS).mintToken(
            currentTokenAddress,
            amount,
            new bytes[](0)
        );

        bool success = _checkResponse(responseCode);

        if (!((_balanceOf(address(this)) - balance) == SafeCast.toUint256(amount))) {
            revert TheSmartContractIsNotTheTreasuryAccount();
        }

        _transfer(account, amount);

        emit TokensMinted(msg.sender, currentTokenAddress, amount, account);

        return success;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CASH_IN_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.mint.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICashIn).interfaceId;
    }
}
