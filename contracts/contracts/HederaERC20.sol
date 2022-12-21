// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import './Interfaces/IHederaERC20.sol';
import './extensions/CashIn.sol';
import './extensions/Burnable.sol';
import './extensions/Wipeable.sol';
import './extensions/Pausable.sol';
import './extensions/Freezable.sol';
import './extensions/Rescatable.sol';
import './extensions/Deletable.sol';
import './hts-precompile/IHederaTokenService.sol';
import './extensions/TokenOwner.sol';

contract HederaERC20 is
    IHederaERC20,
    IERC20Upgradeable,
    CashIn,
    Burnable,
    Wipeable,
    Pausable,
    Freezable,
    Deletable,
    Rescatable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    function initialize(
        IHederaTokenService.HederaToken calldata token,
        uint64 initialTotalSupply,
        uint32 tokenDecimals,
        address originalSender
    ) external payable initializer returns (address) {
        (int64 responseCode, address tokenAddress) = IHederaTokenService(
            precompileAddress
        ).createFungibleToken{value: msg.value}(
            token,
            initialTotalSupply,
            tokenDecimals
        );

        require(
            responseCode == HederaResponseCodes.SUCCESS,
            'Token Creation failed'
        );

        tokenOwner_init(tokenAddress);
        roles_init();
        _setupRole(_getRoleId(roleName.ADMIN), msg.sender); // Assign Admin role to calling contract/user in order to be able to set all the other roles
        grantUnlimitedSupplierRole(originalSender);
        _grantRole(_getRoleId(roleName.BURN), originalSender);
        _grantRole(_getRoleId(roleName.RESCUE), originalSender);
        _grantRole(_getRoleId(roleName.WIPE), originalSender);
        _grantRole(_getRoleId(roleName.PAUSE), originalSender);
        _grantRole(_getRoleId(roleName.FREEZE), originalSender);
        _grantRole(_getRoleId(roleName.DELETE), originalSender);
        _setupRole(_getRoleId(roleName.ADMIN), originalSender); // Assign Admin role to the provided address

        return tokenAddress;
    }

    /**
     * @dev Returns the name of the token
     *
     * @return string The the name of the token
     */
    function name() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).name();
    }

    /**
     * @dev Returns the symbol of the token
     *
     * @return string The the symbol of the token
     */
    function symbol() external view returns (string memory) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).symbol();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return uint8 The number of decimals of the token
     */
    function decimals() public view returns (uint8) {
        return IERC20MetadataUpgradeable(_getTokenAddress()).decimals();
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply()
        external
        view
        override(IHederaERC20, IERC20Upgradeable)
        returns (uint256)
    {
        return IERC20Upgradeable(_getTokenAddress()).totalSupply();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(address account)
        public
        view
        override(IHederaERC20, IERC20Upgradeable)
        returns (uint256)
    {
        return _balanceOf(account);
    }

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
        override(TokenOwner)
        returns (uint256)
    {
        return IERC20Upgradeable(_getTokenAddress()).balanceOf(account);
    }

    /**
     * @dev Associates a account to the token
     *
     * @param adr The address of the account to associate
     *
     */
    function associateToken(address adr) public {
        int256 responseCode = IHederaTokenService(precompileAddress)
            .associateToken(adr, _getTokenAddress());
        _checkResponse(responseCode);

        emit TokenAssociated(_getTokenAddress(), adr);
    }

    /**
     * @dev Dissociates an account from the token
     *
     * @param adr The address of the account to dissociate
     *
     */
    function dissociateToken(address adr) public {
        int256 responseCode = IHederaTokenService(precompileAddress)
            .dissociateToken(adr, _getTokenAddress());
        _checkResponse(responseCode);

        emit TokenDissociated(_getTokenAddress(), adr);
    }

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
    ) internal override(TokenOwner) {
        require(_balanceOf(from) >= amount, 'Insufficient token balance');

        int256 responseCode = IHederaTokenService(precompileAddress)
            .transferToken(_getTokenAddress(), from, to, int64(int256(amount)));
        _checkResponse(responseCode);

        emit TokenTransfer(_getTokenAddress(), from, to, amount);
    }

    /**
     * @dev Transfers an amount of tokens to an account
     *
     * @param to The address the tokens are transferred to
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    /**
     * @dev Function not already implemented
     */
    function allowance(
        address, /*owner*/
        address /*spender*/
    ) external pure returns (uint256) {
        require(false, 'function not already implemented');
        return 0;
        // (int64 responseCode, uint256 amount) = IHederaTokenService(
        //     precompileAddress
        // ).allowance(_getTokenAddress(), owner, spender);
        // return amount;
    }

    /**
     * @dev Function not already implemented
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        int64 responseCode = IHederaTokenService(precompileAddress).approve(
            _getTokenAddress(),
            spender,
            amount
        );
        bool success = _checkResponse(responseCode);

        return success;
    }

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param from The address the tokens are transferred from
     * @param to The address the tokens are transferred to
     * @param amount The amount to transfer
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        int256 responseCode = IHederaTokenService(precompileAddress)
            .transferFrom(_getTokenAddress(), from, to, amount);
        bool response = _checkResponse(responseCode);
        emit TokenTransfer(_getTokenAddress(), from, to, amount);
        return response;
    }
}
