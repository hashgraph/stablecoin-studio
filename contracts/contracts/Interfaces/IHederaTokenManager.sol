// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {KeysStruct} from '../library/KeysLib.sol';

struct RolesStruct {
    bytes32 role;
    address account;
}

interface IHederaTokenManager {
    struct InitializeStruct {
        IHederaTokenService.HederaToken token;
        int64 initialTotalSupply;
        int32 tokenDecimals;
        address originalSender;
        address reserveAddress;
        uint256 updatedAtThreshold;
        RolesStruct[] roles;
        CashinRoleStruct cashinRole;
        string tokenMetadataURI;
    }

    struct CashinRoleStruct {
        address account;
        uint256 allowance;
    }

    struct UpdateTokenStruct {
        string tokenName;
        string tokenSymbol;
        KeysStruct[] keys;
        int64 second;
        int64 autoRenewPeriod;
        string tokenMetadataURI;
    }

    /**
     * @dev Emitted when token updated
     *
     * @param token Token address
     * @param updateTokenStruct Struct containing updated token data
     */
    event TokenUpdated(address indexed token, UpdateTokenStruct updateTokenStruct);

    /**
     * @dev Emitted when a new metadata was set
     *
     * @param admin The account that set the metadata
     * @param metadata The metadata that was set
     */
    event MetadataSet(address indexed admin, string metadata);

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
     * @dev Emitted when the provided `s` is less than 100 characters long
     *
     * @param s The string to check
     */
    error MoreThan100Error(string s);

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

    /**
     * @dev Gets the metadata
     *
     */
    function getMetadata() external view returns (string memory);
}
