// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenService} from '../hts-precompile/IHederaTokenService.sol';
import {KeysLib} from '../library/KeysLib.sol';

interface IHederaTokenManager {
    struct InitializeStruct {
        IHederaTokenService.HederaToken token;
        int64 initialTotalSupply;
        int32 tokenDecimals;
        address originalSender;
        address reserveAddress;
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
    * @dev Emitted when tokens have been transfered from sender to receiver
    *
    * @param token Token address
    * @param sender Sender address
    * @param receiver Receiver address
    * @param amount Transfered amount

    */
    event TokenTransfer(
        address indexed token,
        address indexed sender,
        address indexed receiver,
        int64 amount
    );

    /**
     * @dev Emitted when token updated
     *
     * @param token Token address
     * @param updateTokenStruct Struct containing updated token data
     */
    event TokenUpdated(
        address indexed token,
        UpdateTokenStruct updateTokenStruct
    );

    /**
     * @dev Emitted when transfering funds back to original sender after creating the token did not work
     *
     * @param amount The value to check
     *
     */
    error RefundingError(uint256 amount);

    /**
     * @dev Emitted when updating the token admin key
     *
     */
    error AdminKeyUpdateError();

    /**
     * @dev Emitted when updating the token supply key
     *
     */
    error SupplyKeyUpdateError();

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
     * @dev Update token
     *
     * @param updatedToken Values to update the token
     */
    function updateToken(UpdateTokenStruct calldata updatedToken) external;
}
