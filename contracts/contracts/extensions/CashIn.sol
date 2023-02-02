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
    function mint(
        address account,
        uint256 amount
    )
        external
        override(ICashIn)
        onlyRole(_getRoleId(RoleName.CASHIN))
        checkReserveIncrease(amount)
        checkAddressIsNotZero(account)
        returns (bool)
    {
        if (!_unlimitedSupplierAllowances[msg.sender])
            _decreaseSupplierAllowance(msg.sender, amount);

        address currentTokenAddress = _getTokenAddress();

        (int256 responseCode, , ) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .mintToken(currentTokenAddress, uint64(amount), new bytes[](0));

        bool success = _checkResponse(responseCode);

        _transfer(address(this), account, amount);

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
