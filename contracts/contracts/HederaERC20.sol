// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './Interfaces/IHederaERC20Upgradeable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import './Interfaces/IHederaERC20.sol';
import './extensions/CashIn.sol';
import './extensions/Burnable.sol';
import './extensions/Wipeable.sol';
import './extensions/Pausable.sol';
import './extensions/Freezable.sol';
import './extensions/Rescatable.sol';
import './extensions/Deletable.sol';
import './extensions/Reserve.sol';
import './hts-precompile/IHederaTokenService.sol';
import './extensions/TokenOwner.sol';

contract HederaERC20 is
    IHederaERC20,
    CashIn,
    Burnable,
    Wipeable,
    Pausable,
    Freezable,
    Deletable,
    Rescatable
{
    // using SafeERC20Upgradeable for IHederaERC20Upgradeable;

    // Constructor required to avoid Initializer attack on logic contract
    constructor(){
        _disableInitializers();
    }

    /**
     * @dev Initializes the stable coin frmo the proxy
     *
     * @param token the underlying token to create
     * @param initialTotalSupply the stable coin's initial supply
     * @param tokenDecimals the stable coin's number of decimals
     * @param originalSender the EOA that iniitally requested the stable coin creaiton
     * @param reserveAddress the address of the Data Feed Reserve the stable coin will be associated to (can be null)
     *
     */
    function initialize(
        IHederaTokenService.HederaToken calldata token,
        uint64 initialTotalSupply,
        uint32 tokenDecimals,
        address originalSender,
        address reserveAddress
    )
           checkAddressIsNotNull(originalSender)
        external payable initializer returns (address) 
    {
        __reserve_init(reserveAddress); // Initialize reserve
        __roles_init();
        _setupRole(_getRoleId(RoleName.ADMIN), msg.sender); // Assign Admin role to calling contract/user in order to be able to set all the other roles
        _grantUnlimitedSupplierRole(originalSender);
        _grantRole(_getRoleId(RoleName.BURN), originalSender);
        _grantRole(_getRoleId(RoleName.RESCUE), originalSender);
        _grantRole(_getRoleId(RoleName.WIPE), originalSender);
        _grantRole(_getRoleId(RoleName.PAUSE), originalSender);
        _grantRole(_getRoleId(RoleName.FREEZE), originalSender);
        _grantRole(_getRoleId(RoleName.DELETE), originalSender);
        _setupRole(_getRoleId(RoleName.ADMIN), originalSender); // Assign Admin role to the provided address

        (int64 responseCode, address createdTokenAddress) = IHederaTokenService(
            PRECOMPILED_ADDRESS
        ).createFungibleToken{value: msg.value}(
            token,
            initialTotalSupply,
            tokenDecimals
        );

        require(
            responseCode == HederaResponseCodes.SUCCESS,
            'Token Creation failed'
        );

        __tokenOwner_init(createdTokenAddress);

        return createdTokenAddress;
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
    function decimals() external view returns (uint8) {
        return _decimals();
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view returns (uint256) {
        return _totalSupply();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(
        address account
    ) external view override(IHederaERC20) returns (uint256) {
        return _balanceOf(account);
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
    ) internal view override(TokenOwner) returns (uint256) {
        return IHederaERC20Upgradeable(_getTokenAddress()).balanceOf(account);
    }

    /**
     * @dev Associates a account to the token
     *
     * @param addr The address of the account to associate
     *
     */
    function associateToken(address addr) 
        checkAddressIsNotNull(addr)
    external override(IHederaERC20)
    {

        emit TokenAssociated(_getTokenAddress(), addr);

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS)
            .associateToken(addr, _getTokenAddress());
        
        _checkResponse(responseCode);
    }

    /**
     * @dev Dissociates an account from the token
     *
     * @param addr The address of the account to dissociate
     *
     */
    function dissociateToken(address addr) 
            checkAddressIsNotNull(addr)
    external override(IHederaERC20)
    {

        emit TokenDissociated(_getTokenAddress(), addr);

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS)
            .dissociateToken(addr, _getTokenAddress());
        
        _checkResponse(responseCode);
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
    )   
        checkAddressIsNotNull(from)
        checkAddressIsNotNull(to)
    internal override(TokenOwner) {
        require(_balanceOf(from) >= amount, 'Insufficient token balance');

        emit TokenTransfer(_getTokenAddress(), from, to, amount);

        int256 responseCode = IHederaTokenService(PRECOMPILED_ADDRESS)
            .transferToken(_getTokenAddress(), from, to, int64(int256(amount)));

        _checkResponse(responseCode);
    }

    /**
     * @dev Transfers an amount of tokens to an account
     *
     * @param to The address the tokens are transferred to
     */
    function transfer(address to, uint256 amount) external override(IHederaERC20) returns (bool) {
        _transfer(_msgSender(), to, amount);
        return true;
    }

    /**
     * @dev Function not already implemented
     */
    function allowance(
        address owner,
        address spender
    ) 
        checkAddressIsNotNull(owner)
        checkAddressIsNotNull(spender)
    external override(IHederaERC20) returns (uint256) 
    {
        (, uint256 amount) = IHederaTokenService(PRECOMPILED_ADDRESS).allowance(
            _getTokenAddress(),
            owner,
            spender
        );
        return amount;
    }

    /**
     * @dev Function not already implemented
     */
    function approve(address spender, uint256 amount) 
        checkAddressIsNotNull(spender)
    external override(IHederaERC20) returns (bool) {
        (bool success, bytes memory result) = PRECOMPILED_ADDRESS.delegatecall(
            abi.encodeWithSelector(
                IHederaTokenService.approve.selector,
                _getTokenAddress(),
                spender,
                amount
            )
        );
        int64 responseCode = success
            ? abi.decode(result, (int32))
            : HederaResponseCodes.UNKNOWN;
        success = _checkResponse(responseCode);
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
    ) 
        checkAddressIsNotNull(from)
        checkAddressIsNotNull(to)
    external override(IHederaERC20) returns (bool) 
    {

        emit TokenTransfer(_getTokenAddress(), from, to, amount);

        (bool success, bytes memory result) = PRECOMPILED_ADDRESS.delegatecall(
            abi.encodeWithSelector(
                IHederaTokenService.transferFrom.selector,
                _getTokenAddress(),
                from,
                to,
                amount
            )
        );
        int64 responseCode = success
            ? abi.decode(result, (int32))
            : HederaResponseCodes.UNKNOWN;
        success = _checkResponse(responseCode);

        return success;
    }
}
