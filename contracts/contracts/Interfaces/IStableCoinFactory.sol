// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IStableCoinFactory {
    event Deployed(DeployedStableCoin);

    struct KeysStruct {
        uint256 keyType; // Key id as defined for the Hedera Tokens
        bytes PublicKey; // Public Key bytes of the EOA that will be assigned to the key Role. If "0x" (empty bytes) the stable coin proxy will be selected.
        bool isED25519; // If the PublicKey is an EOA (not empty) indicates whether it is an ED25519 or ECDSA key
    }

    struct TokenStruct {
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        int64 tokenMaxSupply;
        uint64 tokenInitialSupply;
        uint32 tokenDecimals;
        address autoRenewAccountAddress;
        address treasuryAddress;
        address reserveAddress;
        int256 reserveInitialAmount;
        bool createReserve;
        KeysStruct[] keys;
    }

    struct DeployedStableCoin {
        address stableCoinProxy;
        address stableCoinProxyAdmin;
        address stableCoinContractAddress;
        address tokenAddress;
        address reserveProxy;
        address reserveProxyAdmin;
    }

    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    ) external payable returns (DeployedStableCoin memory);
}
