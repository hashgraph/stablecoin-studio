// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenService} from '../hts-precompile/IHederaTokenService.sol';
import {KeysLib} from '../library/KeysLib.sol';

interface IHederaERC20 {
    /**
     * @dev Emitted when the token has been associated to the account
     *
     * @param token Token address
     * @param account Account address
     */
    event TokenAssociated(address token, address account);

    /**
     * @dev Emitted when the token has been dissociated from the account
     *
     * @param token Token address
     * @param account Account address
     */
    event TokenDissociated(address token, address account);

    /**
    * @dev Emitted when tokens have been transfered from sender to receiver
    *
    * @param token Token address
    * @param sender Sender address
    * @param receiver Receiver address
    * @param amount Transfered amount

    */
    event TokenTransfer(
        address token,
        address sender,
        address receiver,
        int64 amount
    );

    /**
    * @dev Emitted when tokens have been transfered from sender to receiver
    *
    * @param token Token address
    * @param sender Sender address
    * @param receiver Receiver address
    * @param amount Transfered amount

    */
    event TokenTransferFrom(
        address token,
        address sender,
        address from,
        address receiver,
        uint256 amount
    );

    /**
     * @dev Emitted when token updated
     *
     * @param token Token address
     * @param updateTokenStruct Struct containing updated token data
     * @param newTreasury Token treasury account
     */
    event TokenUpdated(
        address token,
        UpdateTokenStruct updateTokenStruct,
        address newTreasury
    );

    struct InitializeStruct {
        IHederaTokenService.HederaToken token;
        int64 initialTotalSupply;
        int32 tokenDecimals;
        address originalSender;
        address reserveAddress;
        bool grantKYCToOriginalSender;
        bool treasuryIsContract;
        RolesStruct[] roles;
        CashinRoleStruct cashinRole;
    }

    struct RolesStruct {
        bytes32 role;
        address account;
    }

    struct CashinRoleStruct {
        address account;
        uint256 allowance;
    }

    struct UpdateTokenStruct {
        string tokenName;
        string tokenSymbol;
        KeysLib.KeysStruct[] keys;
        int64 second;
        int64 autoRenewPeriod;
    }

    /**
     * @dev Returns the name of the token
     *
     * @return The the name of the token
     */
    function name() external view returns (string memory);

    /**
     * @dev Returns the symbol of the token
     *
     * @return The the symbol of the token
     */
    function symbol() external view returns (string memory);

    /**
     * @dev Returns the total number of tokens that exits
     *
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Returns the number of decimals of the token
     *
     * @return uint8 The number of decimals of the token
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Associates a account to the token
     *
     * @param addr The address of the account to associate
     *
     */
    function associateToken(address addr) external;

    /**
     * @dev Dissociates an account from the token
     *
     * @param addr The address of the account to dissociate
     *
     */
    function dissociateToken(address addr) external;

    /**
     * @dev Transfers an amount of tokens to an account
     *
     * @param to The address the tokens are transferred to
     */
    function transfer(address to, int64 amount) external returns (bool);

    /**
     * @dev Function not already implemented
     */
    function allowance(
        address owner,
        address spender
    ) external returns (uint256);

    /**
     * @dev Update token
     *
     * @param updatedToken Values to update the token
     */
    function updateToken(UpdateTokenStruct calldata updatedToken) external;
}
