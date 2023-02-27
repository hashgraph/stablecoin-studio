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
import './extensions/TokenOwner.sol';
import './extensions/KYC.sol';

contract HederaERC20 is
    IHederaERC20,
    CashIn,
    Burnable,
    Wipeable,
    Pausable,
    Freezable,
    Deletable,
    Rescatable,
    KYC
{
    // using SafeERC20Upgradeable for IHederaERC20Upgradeable;

    // Constructor required to avoid Initializer attack on logic contract
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the stable coin frmo the proxy
     *
     * @param init the underlying token to create
     *
     */
    function initialize(
        InitializeStruct calldata init
    )
        external
        payable
        initializer
        addressIsNotZero(init.originalSender)
        returns (address)
    {
        __reserveInit(init.reserveAddress); // Initialize reserve
        __rolesInit();
        _grantInitialRoles(init.originalSender, init.roles);

        (int64 responseCode, address createdTokenAddress) = IHederaTokenService(
            _PRECOMPILED_ADDRESS
        ).createFungibleToken{value: msg.value}(
            init.token,
            init.initialTotalSupply,
            init.tokenDecimals
        );

        _checkResponse(responseCode);

        __tokenOwnerInit(createdTokenAddress);

        // Associate token if required
        if (init.treasuryIsContract) {
            _associateToken(init.originalSender);

            // Grant KYC if required
            if (init.grantKYCToOriginalSender) {
                responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
                    .grantTokenKyc(createdTokenAddress, init.originalSender);

                require(
                    responseCode == HederaResponseCodes.SUCCESS,
                    'KYC grant failed'
                );
            }
        }

        return createdTokenAddress;
    }

    function _grantInitialRoles(
        address originalSender,
        RolesStruct[] memory roles
    ) private onlyInitializing {
        for (uint256 i = 0; i < roles.length; i++) {
            _grantRole(roles[i].role, roles[i].account);
        }
        _setupRole(_getRoleId(RoleName.ADMIN), originalSender); // Assign Admin role to the provided address*/
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
    function associateToken(
        address addr
    ) external override(IHederaERC20) addressIsNotZero(addr) {
        _associateToken(addr);
    }

    /**
     * @dev Associates a account to the token
     *
     * @param addr The address of the account to associate
     *
     */
    function _associateToken(address addr) private addressIsNotZero(addr) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .associateToken(addr, currentTokenAddress);

        _checkResponse(responseCode);

        emit TokenAssociated(currentTokenAddress, addr);
    }

    /**
     * @dev Dissociates an account from the token
     *
     * @param addr The address of the account to dissociate
     *
     */
    function dissociateToken(
        address addr
    ) external override(IHederaERC20) addressIsNotZero(addr) {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .dissociateToken(addr, currentTokenAddress);

        _checkResponse(responseCode);

        emit TokenDissociated(currentTokenAddress, addr);
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
        int64 amount
    )
        internal
        override(TokenOwner)
        valueIsNotGreaterThan(uint256(uint64(amount)), _balanceOf(from), true)
    {
        address currentTokenAddress = _getTokenAddress();

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .transferToken(currentTokenAddress, from, to, amount);

        _checkResponse(responseCode);

        emit TokenTransfer(currentTokenAddress, from, to, amount);
    }

    /**
     * @dev Transfers an amount of tokens to an account
     *
     * @param to The address the tokens are transferred to
     */
    function transfer(
        address to,
        int64 amount
    )
        external
        override(IHederaERC20)
        addressIsNotZero(to)
        amountIsNotNegative(amount, false)
        returns (bool)
    {
        _transfer(msg.sender, to, amount);

        return true;
    }

    /**
     * @dev Function not already implemented
     */
    function allowance(
        address owner,
        address spender
    )
        external
        override(IHederaERC20)
        addressIsNotZero(owner)
        addressIsNotZero(spender)
        returns (uint256)
    {
        (, uint256 amount) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .allowance(_getTokenAddress(), owner, spender);
        return amount;
    }

    /**
     * @dev Function not already implemented
     */
    function approve(
        address spender,
        uint256 amount
    ) external override(IHederaERC20) addressIsNotZero(spender) returns (bool) {
        (bool success, bytes memory result) = _PRECOMPILED_ADDRESS.delegatecall(
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
        external
        override(IHederaERC20)
        addressIsNotZero(from)
        addressIsNotZero(to)
        valueIsNotGreaterThan(amount, _balanceOf(from), true)
        returns (bool)
    {
        address currentTokenAddress = _getTokenAddress();

        (bool success, bytes memory result) = _PRECOMPILED_ADDRESS.delegatecall(
            abi.encodeWithSelector(
                IHederaTokenService.transferFrom.selector,
                currentTokenAddress,
                from,
                to,
                amount
            )
        );
        int64 responseCode = success
            ? abi.decode(result, (int32))
            : HederaResponseCodes.UNKNOWN;
        success = _checkResponse(responseCode);

        emit TokenTransferFrom(
            currentTokenAddress,
            msg.sender,
            from,
            to,
            amount
        );

        return success;
    }
}
