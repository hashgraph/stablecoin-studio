// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/HederaResponseCodes.sol";
import "./HederaERC20.sol";
import "./HederaERC1967Proxy.sol";

interface IStableCoinFactory {

    struct tokenStruct{
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        uint32 tokenMaxSupply;
        IHederaTokenService.Expiry tokenExpiry;
        uint tokenInitialSupply;
        uint tokenDecimals;
        bytes senderPublicKey;
    }

    function deployStableCoin(
        tokenStruct calldata requestedToken
    ) external payable returns (address);
}

contract StableCoinFactory is IStableCoinFactory, HederaResponseCodes{

    // Hedera HTS precompiled contract
    address constant precompileAddress = address(0x167);
    string constant memo_1 = "({proxyContract: ";
    string constant memo_2 = "})";

    function deployStableCoin(tokenStruct calldata requestedToken) external payable override returns (address){

        // Deploy logic contract
        HederaERC20 StableCoinContract = new HederaERC20();

        // Deploy Proxy
        HederaERC1967Proxy StableCoinProxy = new HederaERC1967Proxy(address(StableCoinContract), "");

        // Create Token
        bytes memory tokenMemo = abi.encodePacked(memo_1, address(StableCoinProxy), memo_2);


        IHederaTokenService.KeyValue memory SenderKey = IHederaTokenService.KeyValue({
            inheritAccountKey: false,
            contractId: address(0),
            ed25519: abi.encodePacked(address(0)),
            ECDSA_secp256k1: requestedToken.senderPublicKey,
            delegatableContractId: address(0)});

        IHederaTokenService.KeyValue memory ProxyKey = IHederaTokenService.KeyValue({
            inheritAccountKey: false,
            contractId: address(StableCoinProxy),
            ed25519: bytes(""),
            ECDSA_secp256k1: bytes(""),
            delegatableContractId: address(StableCoinProxy)
        });


        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](4);
        keys[0] = IHederaTokenService.TokenKey({keyType: 0, key: SenderKey}); // admin
        keys[1] = IHederaTokenService.TokenKey({keyType: 2, key: SenderKey}); // freeze
        keys[2] = IHederaTokenService.TokenKey({keyType: 3, key: ProxyKey}); // wipe
        keys[3] = IHederaTokenService.TokenKey({keyType: 4, key: ProxyKey}); // supply

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken({
            name: requestedToken.tokenName,
            symbol: requestedToken.tokenSymbol,
            treasury: address(StableCoinProxy),
            memo: string(tokenMemo),
            tokenSupplyType: requestedToken.supplyType,
            maxSupply: requestedToken.tokenMaxSupply,
            freezeDefault: requestedToken.freeze,
            tokenKeys: keys,
            expiry: requestedToken.tokenExpiry
        });

        (int64 responseCode, address tokenAddress) = 
            IHederaTokenService(precompileAddress).createFungibleToken{value: msg.value}
                (token, 
                requestedToken.tokenInitialSupply, 
                requestedToken.tokenDecimals);

        require(responseCode == HederaResponseCodes.SUCCESS, "Token Creation failed");

        // Initialize Proxy
        HederaERC20(address(StableCoinProxy)).initialize(tokenAddress);

        // Associate token
        HederaERC20(address(StableCoinProxy)).associateToken(msg.sender);

        return address(StableCoinProxy);
        
    }
}