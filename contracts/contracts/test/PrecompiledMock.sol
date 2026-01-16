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
}

contract PrecompiledMockStorageWrapper {
    address private hederaToken;
    bool private kyc;
    bool private deleted;

    function _createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) internal returns (int64 responseCode, address tokenAddress) {
        tokenAddress = address(new StableCoinTokenMock(token, initialTotalSupply, decimals));
        hederaToken = tokenAddress;
        return (HederaResponseCodes.SUCCESS, tokenAddress);
    }

    function _grantTokenKyc(address, address) internal returns (int64 responseCode) {
        kyc = true;
        return HederaResponseCodes.SUCCESS;
    }

    function _revokeTokenKyc(address, address) internal returns (int64 responseCode) {
        kyc = false;
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
        StableCoinTokenMock(hederaToken).increaseBalance(uint256(uint64(amount)));
        return (HederaResponseCodes.SUCCESS, amount, serialNumbers);
    }

    function _burnToken(
        address,
        int64 amount,
        int64[] memory
    ) internal returns (int64 responseCode, int64 newTotalSupply) {
        StableCoinTokenMock(hederaToken).decreaseBalance(uint256(uint64(amount)));
        return (HederaResponseCodes.SUCCESS, newTotalSupply);
    }

    function _transferToken(
        address,
        address,
        address,
        int64
    ) internal view returns (int64 responseCode) {
        if (!kyc) {
            return (HederaResponseCodes.ACCOUNT_KYC_NOT_GRANTED_FOR_TOKEN);
        }
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
    ) external view returns (int64 responseCode) {
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
}
