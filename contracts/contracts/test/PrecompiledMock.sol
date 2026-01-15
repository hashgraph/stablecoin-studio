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

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external returns (int64 responseCode);

    function revokeTokenKyc(address token, address account) external returns (int64 responseCode);
}

contract PrecompiledMockStorageWrapper {
    address private hederaToken;
    bool private kyc;

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
        StableCoinTokenMock(hederaToken).increaseBalance(uint256(uint64(amount)));
        return (HederaResponseCodes.SUCCESS, amount, serialNumbers);
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

    function transferToken(
        address token,
        address sender,
        address recipient,
        int64 amount
    ) external view returns (int64 responseCode) {
        return _transferToken(token, sender, recipient, amount);
    }
}
