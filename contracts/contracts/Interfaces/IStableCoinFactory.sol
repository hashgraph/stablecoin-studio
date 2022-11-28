
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableCoinFactory {

    struct KeysStruct{
        uint256 keyType; // Key id as defined for the Hedera Tokens
        bytes PublicKey; // Public Key bytes of the EOA that will be assigned to the key Role. If "0x" (empty bytes) the stable coin proxy will be selected.
    }

    struct tokenStruct{
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        int64 tokenMaxSupply;
        uint64 tokenInitialSupply;
        uint32 tokenDecimals;
        address autoRenewAccountAddress;
        address treasuryAddress;
        KeysStruct[] keys;
    }

    function deployStableCoin(
        tokenStruct calldata requestedToken
    ) external payable returns (address, address, address, address);
}