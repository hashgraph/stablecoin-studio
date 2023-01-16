// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/ITokenOwner.sol';
import '../hts-precompile/HederaResponseCodes.sol';
import '../hts-precompile/IHederaTokenService.sol';
import '../Interfaces/IHederaERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';

abstract contract TokenOwner is
    ITokenOwner,
    HederaResponseCodes,
    Initializable
{
    // Hedera HTS precompiled contract
    address internal constant PRECOMPILED_ADDRESS = address(0x167);
    // HTS Token this contract owns
    address private tokenAddress;

    // modifier to check that an address is not 0
    modifier checkAddressIsNotNull(address addr)
    {
        _checkAddressIsNotNull(addr);
        _;
    }

    function _checkAddressIsNotNull(address addr) internal pure
    {
        require(addr != address(0), "Provided address is 0");
    }

    // Initiliazes the token address
    function __tokenOwner_init(address initTokenAddress) internal onlyInitializing {
        tokenAddress = initTokenAddress;
    }

    /**
     * @dev Returns the token address
     *
     * @return address of The token address
     */
    function getTokenAddress() external override(ITokenOwner) view returns (address) {
        return _getTokenAddress();
    }

    /**
     * @dev Returns the token address
     *
     * @return address of The token address
     */
    function _getTokenAddress() internal view returns (address) {
        return tokenAddress;
    }

    /**
     * @dev Transforms the response from a HederaResponseCodes to a boolean
     *
     * @param responseCode The Hedera response code to transform
     */
    function _checkResponse(int256 responseCode) internal pure returns (bool) {
        require(responseCode == HederaResponseCodes.SUCCESS, 'Error');
        return true;
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function _totalSupply() internal view returns (uint256) {
        return IHederaERC20Upgradeable(tokenAddress).totalSupply();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return uint8 The number of decimals of the token
     */
    function _decimals() internal view returns (uint8) {
        return IERC20MetadataUpgradeable(tokenAddress).decimals();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */

    function _balanceOf(
        address account
    ) internal view virtual returns (uint256);

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param from The address the tokens are transferred from
     * @param to The address the tokens are transferred to
     */
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual;
}
