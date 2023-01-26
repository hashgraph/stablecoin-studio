// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IStableCoinFactory {
    event Deployed(DeployedStableCoin);

    struct KeysStruct {
        // Key id as defined for the Hedera Tokens
        uint256 keyType;
        // Public Key bytes of the EOA that will be assigned to the key Role
        // If "0x" (empty bytes) the stable coin proxy will be selected
        bytes publicKey;
        // If the PublicKey is an EOA (not empty) indicates whether it is an ED25519 or ECDSA key
        bool isED25519;
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
        bool grantKYCToOriginalSender;
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
