// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Common} from '../core/Common.sol';
// solhint-disable-next-line max-line-length
import {IERC20MetadataUpgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {_TOKEN_OWNER_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract TokenOwnerStorageWrapper is Common {
    // Hedera HTS precompiled contract
    address internal constant _PRECOMPILED_ADDRESS = address(0x167);
    struct TokenOwnerStorage {
        // 2 bytes offset - maintained for compatibility with legacy migration layout
        bytes2 offset;
        // HTS Token this contract owns
        address tokenAddress;
    }


    /**
     * @dev Emitted when tokens have been transferred from sender to receiver
     *
     * @param token Token address
     * @param sender Sender address
     * @param receiver Receiver address
     * @param amount Transferred amount
     */
    event TokenTransfer(address indexed token, address indexed sender, address indexed receiver, int64 amount);

    /**
     * @dev Initializes the value of token address
     *
     * @param initTokenAddress The token address value
     */
    function __tokenOwnerInit(address initTokenAddress) internal {
        _tokenOwnerStorage().tokenAddress = initTokenAddress;
    }

    /**
     * @dev Returns the token address
     *
     */
    function _getTokenAddress() internal view returns (address) {
        return _tokenOwnerStorage().tokenAddress;
    }

    /**
     * @dev Returns the total number of tokens that exits
     *
     */
    function _totalSupply() internal view returns (uint256) {
        return IERC20Upgradeable(_tokenOwnerStorage().tokenAddress).totalSupply();
    }

    /**
     * @dev Returns the number of decimals of the token
     *
     */
    function _decimals() internal view returns (uint8) {
        return IERC20MetadataUpgradeable(_tokenOwnerStorage().tokenAddress).decimals();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     */
    function _balanceOf(address account) internal view returns (uint256) {
        return IERC20Upgradeable(_getTokenAddress()).balanceOf(account);
    }

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param to The address the tokens are transferred to
     * @param amount The amount of tokens to be transferred
     */
    function _transfer(
        address to,
        int64 amount
    ) internal valueIsNotGreaterThan(uint256(SafeCast.toUint256(amount)), _balanceOf(address(this)), true) {
        if (to != address(this)) {
            address currentTokenAddress = _getTokenAddress();

            int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
                currentTokenAddress,
                address(this),
                to,
                amount
            );

            _checkResponse(responseCode);

            emit TokenTransfer(currentTokenAddress, address(this), to, amount);
        }
    }

    function _tokenOwnerStorage() internal pure returns (TokenOwnerStorage storage tokenOwnerStorage_) {
        bytes32 position = _TOKEN_OWNER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            tokenOwnerStorage_.slot := position
        }
    }
}
