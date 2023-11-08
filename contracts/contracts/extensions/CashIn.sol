// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ICashIn} from './Interfaces/ICashIn.sol';
import {SupplierAdmin} from './SupplierAdmin.sol';
import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import {Reserve} from './Reserve.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';

abstract contract CashIn is ICashIn, SupplierAdmin, Reserve {
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
        onlyRole(_getRoleId(RoleName.CASHIN))
        checkReserveIncrease(SafeCast.toUint256(amount))
        addressIsNotZero(account)
        amountIsNotNegative(amount, false)
        returns (bool)
    {
        if (!_unlimitedSupplierAllowances[msg.sender])
            //si no es unlimited
            _decreaseSupplierAllowance(msg.sender, SafeCast.toUint256(amount));

        address currentTokenAddress = _getTokenAddress();

        uint256 balance = _balanceOf(address(this));

        (int64 responseCode, , ) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .mintToken(currentTokenAddress, amount, new bytes[](0));

        bool success = _checkResponse(responseCode);

        if (
            !((_balanceOf(address(this)) - balance) ==
                SafeCast.toUint256(amount))
        ) revert('The smart contract is not the treasury account');

        _transfer(account, amount);

        emit TokensMinted(msg.sender, currentTokenAddress, amount, account);

        return success;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}
