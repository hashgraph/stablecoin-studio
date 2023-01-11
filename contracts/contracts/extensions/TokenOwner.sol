// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import './Interfaces/ITokenOwner.sol';
import '../hts-precompile/HederaResponseCodes.sol';
import '../hts-precompile/IHederaTokenService.sol';
import '../Interfaces/IHederaERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

abstract contract TokenOwner is
    ITokenOwner,
    HederaResponseCodes,
    Initializable
{
    // Hedera HTS precompiled contract
    address constant precompileAddress = address(0x167);
    // HTS Token this contract owns
    address internal _tokenAddress;

    // Initiliazes the token address
    function tokenOwner_init(address tokenAddress) internal onlyInitializing {
        _tokenAddress = tokenAddress;
    }

    /**
     * @dev Returns the token address
     *
     * @return address of The token address
     */
    function getTokenAddress() external view returns (address) {
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
    function _checkResponse(int256 responseCode) internal pure returns (bool) {
        require(responseCode == HederaResponseCodes.SUCCESS, 'Error');
        return true;
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view virtual returns (uint256);

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */

    function _balanceOf(address account)
        internal
        view
        virtual
        returns (uint256);

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
