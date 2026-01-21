// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity 0.8.18;

import {
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import {
    IHederaTokenService
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import {StableCoinTokenMock} from "./StableCoinTokenMock.sol";

interface IPrecompiledMock {
    function createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) external payable returns (int64 responseCode, address tokenAddress);

    function grantTokenKyc(address token, address account) external returns (int64 responseCode);

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers);

    function burnToken(
        address token,
        int64 amount,
        int64[] memory serialNumbers
    ) external returns (int64 responseCode, int64 newTotalSupply);

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int64 responseCode);

    function revokeTokenKyc(address token, address account) external returns (int64 responseCode);

    function pauseToken(address token) external returns (int64 responseCode);

    function unpauseToken(address token) external returns (int64 responseCode);

    function updateFungibleTokenCustomFees(
        address token,
        IHederaTokenService.FixedFee[] memory fixedFees,
        IHederaTokenService.FractionalFee[] memory fractionalFees
    ) external returns (int64 responseCode);

    function deleteToken(address token) external returns (int64 responseCode);

    function freezeToken(address token, address account) external returns (int64 responseCode);

    function unfreezeToken(address token, address account) external returns (int64 responseCode);

    function wipeTokenAccount(
        address token,
        address account,
        int64 amount
    ) external returns (int64 responseCode);

    function getTokenInfo(address token)
    external returns (int64 responseCode, IHederaTokenService.TokenInfo memory tokenInfo);

    function updateTokenInfo(address token, IHederaTokenService.HederaToken memory tokenInfo)
    external
    returns (int64 responseCode);

    function getTokenKey(address token, uint keyType)
    external
    returns (int64 responseCode, IHederaTokenService.KeyValue memory key);
}

contract PrecompiledMockStorageWrapper {
    address private hederaToken;
    IHederaTokenService.TokenInfo private tokenInfo;
    bool private deleted;
    bool private tokenKyc;
    mapping(address account => bool kyc) private kyc;
    mapping(address account => bool frozen) private frozen;

    function _createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) internal returns (int64 responseCode, address tokenAddress) {
        tokenKyc = _hasKycKey(token);
        tokenAddress = address(new StableCoinTokenMock(token, initialTotalSupply, decimals));
        hederaToken = tokenAddress;
        deleted = false;
        return (HederaResponseCodes.SUCCESS, tokenAddress);
    }

    function _hasKycKey(
        IHederaTokenService.HederaToken memory token
    ) private pure returns (bool) {
        uint256 KYC_KEY_BIT = 1 << 1;

        for (uint256 i = 0; i < token.tokenKeys.length; i++) {
            if ((token.tokenKeys[i].keyType & KYC_KEY_BIT) != 0) {
                return true;
            }
        }

        return false;
    }

    function _grantTokenKyc(address, address account) internal returns (int64 responseCode) {
        kyc[account] = true;
        return HederaResponseCodes.SUCCESS;
    }

    function _revokeTokenKyc(address, address account) internal returns (int64 responseCode) {
        kyc[account] = false;
        return HederaResponseCodes.SUCCESS;
    }

    function _mintToken(
        address,
        int64 amount,
        bytes[] memory
    ) internal returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers) {
        if (deleted) {
            return (HederaResponseCodes.TOKEN_WAS_DELETED, 0, serialNumbers);
        }
        StableCoinTokenMock(hederaToken).increaseTotalSupply(uint256(uint64(amount)));
        return (HederaResponseCodes.SUCCESS, amount, serialNumbers);
    }

    function _burnToken(
        address,
        int64 amount,
        int64[] memory
    ) internal returns (int64 responseCode, int64 newTotalSupply) {
        StableCoinTokenMock(hederaToken).decreaseTotalSupply(uint256(uint64(amount)));
        return (HederaResponseCodes.SUCCESS, newTotalSupply);
    }

    function _transferToken(
        address,
        address sender,
        address recipient,
        int64 amount
    ) internal returns (int64 responseCode) {
        // Checking the sender is not needed since the sender will be always the stablecoin contract itself
        // In the tests we will assume that the stablecoin contract has the KYC granted
        if (tokenKyc && (!kyc[recipient])) {
            return (HederaResponseCodes.ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN);
        }
        if (frozen[sender] || frozen[recipient]) {
            return (HederaResponseCodes.ACCOUNT_FROZEN_FOR_TOKEN);
        }
        StableCoinTokenMock(hederaToken).increaseBalance(recipient, uint256(uint64(amount)));
        StableCoinTokenMock(hederaToken).decreaseBalance(sender, uint256(uint64(amount)));
        return HederaResponseCodes.SUCCESS;
    }

    function _pauseToken(address) internal pure returns (int64 responseCode) {
        return HederaResponseCodes.SUCCESS;
    }

    function _unpauseToken(address) internal pure returns (int64 responseCode) {
        return HederaResponseCodes.SUCCESS;
    }

    function _updateFungibleTokenCustomFees(
        address,
        IHederaTokenService.FixedFee[] memory,
        IHederaTokenService.FractionalFee[] memory
    ) internal pure returns (int64 responseCode) {
        return HederaResponseCodes.SUCCESS;
    }

    function _deleteToken(address) internal returns (int64 responseCode) {
        deleted = true;
        return HederaResponseCodes.SUCCESS;
    }

    function _freezeToken(address, address account) internal returns (int64 responseCode) {
        frozen[account] = true;
        return HederaResponseCodes.SUCCESS;
    }

    function _unfreezeToken(address, address account) internal returns (int64 responseCode) {
        frozen[account] = false;
        return HederaResponseCodes.SUCCESS;
    }

    function _wipeTokenAccount(
        address,
        address account,
        int64 amount
    ) internal returns (int64 responseCode) {
        if (StableCoinTokenMock(hederaToken).balanceOf(account) < uint256(uint64(amount))) {
            return (HederaResponseCodes.INVALID_WIPING_AMOUNT);
        }
        StableCoinTokenMock(hederaToken).decreaseBalance(account, uint256(uint64(amount)));
        StableCoinTokenMock(hederaToken).decreaseTotalSupply(uint256(uint64(amount)));
        return HederaResponseCodes.SUCCESS;
    }

    function _getTokenInfo(address)
    internal view returns (int64, IHederaTokenService.TokenInfo memory) {
        return (HederaResponseCodes.SUCCESS, tokenInfo);
    }

    function _updateTokenInfo(address, IHederaTokenService.HederaToken memory)
    internal pure
    returns (int64 responseCode) {
        return (HederaResponseCodes.SUCCESS);
    }

    function _getTokenKey(address, uint keyType)
    internal view
    returns (int64 responseCode, IHederaTokenService.KeyValue memory key) {
        IHederaTokenService.TokenKey[] memory tokenKeys = StableCoinTokenMock(hederaToken).getTokenKeys();
        for (uint256 i = 0; i < tokenKeys.length; i++) {
            if ((tokenKeys[i].keyType & keyType) != 0) {
                return (HederaResponseCodes.SUCCESS, tokenKeys[i].key);
            }
        }
        // key not found
        return  (
            HederaResponseCodes.KEY_NOT_PROVIDED,
            IHederaTokenService.KeyValue({
                inheritAccountKey: false,
                contractId: address(0),
                ed25519: "",
                ECDSA_secp256k1: "",
                delegatableContractId: address(0)
            })
        );
    }
}

contract PrecompiledMock is IPrecompiledMock, PrecompiledMockStorageWrapper {
    function createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) external payable returns (int64 responseCode, address tokenAddress) {
        return _createFungibleToken(token, initialTotalSupply, decimals);
    }

    function grantTokenKyc(
        address token, address account
    ) external returns (int64 responseCode) {
        return _grantTokenKyc(token, account);
    }

    function revokeTokenKyc(
        address token, address account
    ) external returns (int64 responseCode) {
        return _revokeTokenKyc(token, account);
    }

    function mintToken(
        address token,
        int64 amount,
        bytes[] memory metadata
    ) external returns (int64 responseCode, int64 newTotalSupply, int64[] memory serialNumbers) {
        return _mintToken(token, amount, metadata);
    }

    function burnToken(
        address token,
        int64 amount,
        int64[] memory serialNumbers
    ) external returns (int64 responseCode, int64 newTotalSupply) {
        return _burnToken(token, amount, serialNumbers);
    }

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int64 responseCode) {
        return _transferToken(token, sender, recipient, amount);
    }

    function pauseToken(address token) external pure returns (int64 responseCode) {
        return _pauseToken(token);
    }

    function unpauseToken(address token) external pure returns (int64 responseCode) {
        return _unpauseToken(token);
    }

    function updateFungibleTokenCustomFees(
        address token,
        IHederaTokenService.FixedFee[] memory fixedFees,
        IHederaTokenService.FractionalFee[] memory fractionalFees
    ) external pure returns (int64 responseCode) {
        return _updateFungibleTokenCustomFees(token, fixedFees, fractionalFees);
    }

    function deleteToken(address token) external returns (int64 responseCode) {
        return _deleteToken(token);
    }

    function freezeToken(address token, address account) external returns (int64 responseCode) {
        return _freezeToken(token, account);
    }

    function unfreezeToken(address token, address account) external returns (int64 responseCode) {
        return _unfreezeToken(token, account);
    }

    function wipeTokenAccount(
        address token,
        address account,
        int64 amount
    ) external returns (int64 responseCode) {
        return _wipeTokenAccount(token, account, amount);
    }

    function getTokenInfo(address token)
    external view returns (int64 responseCode, IHederaTokenService.TokenInfo memory tokenInfo) {
        return _getTokenInfo(token);
    }

    function updateTokenInfo(address token, IHederaTokenService.HederaToken memory tokenInfo)
    external pure
    returns (int64 responseCode) {
        return _updateTokenInfo(token, tokenInfo);
    }

    function getTokenKey(address token, uint keyType)
    external view
    returns (int64 responseCode, IHederaTokenService.KeyValue memory key) {
        return _getTokenKey(token, keyType);
    }
}
