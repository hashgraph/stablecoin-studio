// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/ICashIn.sol';
import './SupplierAdmin.sol';
import './Reserve.sol';
import '../hts-precompile/IHederaTokenService.sol';

abstract contract CashIn is ICashIn, SupplierAdmin, Reserve {
    /**
     * @dev Creates an `amount` of tokens and transfers them to an `account`, increasing
     * the total supply
     *
     * @param account The address that receives minted tokens
     * @param amount The number of tokens to be minted
     */
    function mint(address account, uint256 amount)
        external
        onlyRole(_getRoleId(RoleName.CASHIN))
        checkReserveIncrease(amount)
        checkAddressIsNotZero(account)
        override(ICashIn)
        returns (bool)
    {
        if (!unlimitedSupplierAllowances[msg.sender])_decreaseSupplierAllowance(msg.sender, amount);
        
        emit TokensMinted(msg.sender, _getTokenAddress(), amount, account);

        (int256 responseCode, , ) = IHederaTokenService(PRECOMPILED_ADDRESS)
            .mintToken(_getTokenAddress(), uint64(amount), new bytes[](0));

        bool success = _checkResponse(responseCode);

        _transfer(address(this), account, amount);

        return success;
    }
}
