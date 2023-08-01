// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenService} from "hedera-smart-contracts/contracts/hts-precompile/IHederaTokenService.sol";

library KeysLib {
    struct KeysStruct {
        // Key id as defined for the Hedera Tokens
        uint256 keyType;
        // Public Key bytes of the EOA that will be assigned to the key Role
        // If "0x" (empty bytes) the stable coin proxy will be selected
        bytes publicKey;
        // If the PublicKey is an EOA (not empty) indicates whether it is an ED25519 or ECDSA key
        bool isED25519;
    }

    /**
     * @dev Generates a IHederaTokenService.KeyValue depending on a public key
     *
     * @param publicKey The public key
     * @param stableCoinProxyAddress The stable coin proxy address
     * @param isED25519 A flag that indicates if the public key is an Ed25519 key
     */
    function generateKey(
        bytes memory publicKey,
        address stableCoinProxyAddress,
        bool isED25519
    ) internal pure returns (IHederaTokenService.KeyValue memory) {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory key;
        if (publicKey.length == 0)
            key.delegatableContractId = stableCoinProxyAddress;
        else if (isED25519) key.ed25519 = publicKey;
        else key.ECDSA_secp256k1 = publicKey;

        return key;
    }

    /**
     * @dev Checks if a token key existis depending on the key bit index and the key type
     *
     * @param keyBitIndex The key bit index
     * @param keyType The key type
     */
    function containsKey(
        uint256 keyBitIndex,
        uint256 keyType
    ) internal pure returns (bool) {
        return (bytes32(keyType) & bytes32(1 << keyBitIndex)) != 0;
    }
}
