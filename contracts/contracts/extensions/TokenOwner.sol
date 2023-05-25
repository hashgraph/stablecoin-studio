// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {ITokenOwner} from './Interfaces/ITokenOwner.sol';
import {HederaResponseCodes} from '../hts-precompile/HederaResponseCodes.sol';
import {IHederaTokenService} from '../hts-precompile/IHederaTokenService.sol';
import {
    IERC20Upgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {
    Initializable
} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {
    IERC20MetadataUpgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

abstract contract TokenOwner is
    ITokenOwner,
    HederaResponseCodes,
    Initializable
{
    // Hedera HTS precompiled contract
    address internal constant _PRECOMPILED_ADDRESS = address(0x167);
    // HTS Token this contract owns
    address private _tokenAddress;

    // modifier to check that value is not less than ref
    modifier valueIsNotLessThan(
        uint256 value,
        uint256 ref,
        bool equalAccepted
    ) {
        _valueIsNotLessThan(value, ref, equalAccepted);
        _;
    }

    function _valueIsNotLessThan(
        uint256 value,
        uint256 ref,
        bool equalAccepted
    ) private pure {
        if (equalAccepted ? value < ref : value <= ref)
            revert LessThan(value, ref);
    }

    // modifier to check that value is not greater than ref
    modifier valueIsNotGreaterThan(
        uint256 value,
        uint256 ref,
        bool equalAccepted
    ) {
        _valueIsNotGreaterThan(value, ref, equalAccepted);
        _;
    }

    function _valueIsNotGreaterThan(
        uint256 value,
        uint256 ref,
        bool equalAccepted
    ) private pure {
        if (equalAccepted ? value > ref : value >= ref)
            revert GreaterThan(value, ref);
    }

    // modifier to check that amount is not negative
    modifier amountIsNotNegative(int256 amount, bool zeroAccepted) {
        _amountIsNotNegative(amount, zeroAccepted);
        _;
    }

    function _amountIsNotNegative(
        int256 amount,
        bool zeroAccepted
    ) private pure {
        if (zeroAccepted ? amount < 0 : amount <= 0)
            revert NegativeAmount(amount);
    }

    // modifier to check that an address is not 0
    modifier addressIsNotZero(address addr) {
        _addressIsNotZero(addr);
        _;
    }

    function _addressIsNotZero(address addr) private pure {
        if (addr == address(0)) revert AddressZero(addr);
    }

    // Initiliazes the token address
    function __tokenOwnerInit(
        address initTokenAddress
    ) internal onlyInitializing {
        _tokenAddress = initTokenAddress;
    }

    /**
     * @dev Returns the token address
     *
     * @return address of The token address
     */
    function getTokenAddress()
        external
        view
        override(ITokenOwner)
        returns (address)
    {
        return _getTokenAddress();
    }

    /**
     * @dev Returns the token address
     *
     * @return address of The token address
     */
    function _getTokenAddress() internal view returns (address) {
        return _tokenAddress;
    }

    /**
     * @dev Transforms the response from a HederaResponseCodes to a boolean
     *
     * @param responseCode The Hedera response code to transform
     */
    function _checkResponse(int64 responseCode) internal pure returns (bool) {
        if (responseCode != HederaResponseCodes.SUCCESS)
            revert ResponseCodeInvalid(responseCode);
        return true;
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return int64 The total number of tokens that exists
     */
    function _totalSupply() internal view returns (uint256) {
        return IERC20Upgradeable(_tokenAddress).totalSupply();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return int32 The number of decimals of the token
     */
    function _decimals() internal view returns (uint8) {
        return IERC20MetadataUpgradeable(_tokenAddress).decimals();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return int64 The number number tokens that an account has
     */

    function _balanceOf(
        address account
    ) internal view virtual returns (uint256);

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param to The address the tokens are transferred to
     */
    function _transfer(address to, int64 amount) internal virtual;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}
