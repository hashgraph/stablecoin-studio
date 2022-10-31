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
        IHederaTokenService.HederaToken memory token = createToken(
            requestedToken.tokenName,
            requestedToken.tokenSymbol,
            requestedToken.freeze,
            requestedToken.supplyType,
            requestedToken.tokenMaxSupply,
            address(StableCoinProxy),
            requestedToken.senderPublicKey
        );
        
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

    function createToken (string memory tokenName,
        string memory tokenSymbol,
        bool freeze,
        bool supplyType,
        uint32 tokenMaxSupply,
        address StableCoinProxyAddress,
        bytes memory senderPublicKey) 
    internal view returns (IHederaTokenService.HederaToken memory){

        bytes memory tokenMemo = abi.encodePacked(memo_1, StableCoinProxyAddress, memo_2);

        IHederaTokenService.Expiry memory tokenExpiry = IHederaTokenService.Expiry({
            second: 10000,
            autoRenewAccount: msg.sender,
            autoRenewPeriod: 10000
        });

        IHederaTokenService.KeyValue memory SenderKey = createKeyValue(
            false,
            address(0),
            bytes(""),
            senderPublicKey,
            address(0)
        );

        IHederaTokenService.KeyValue memory ProxyKey = createKeyValue(
            false,
            StableCoinProxyAddress,
            bytes(""),
            bytes(""),
            StableCoinProxyAddress
        );
        
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](4);
        keys[0] = IHederaTokenService.TokenKey({keyType: 0, key: SenderKey}); // admin
        keys[1] = IHederaTokenService.TokenKey({keyType: 2, key: SenderKey}); // freeze
        keys[2] = IHederaTokenService.TokenKey({keyType: 3, key: ProxyKey}); // wipe
        keys[3] = IHederaTokenService.TokenKey({keyType: 4, key: ProxyKey}); // supply

        return IHederaTokenService.HederaToken({
            name: tokenName,
            symbol: tokenSymbol,
            treasury: StableCoinProxyAddress,
            memo: string(tokenMemo),
            tokenSupplyType: supplyType,
            maxSupply: tokenMaxSupply,
            freezeDefault: freeze,
            tokenKeys: keys,
            expiry: tokenExpiry
        });
    }

    function createKeyValue(bool _inheritAccountKey,
        address _contractId,
        bytes memory _ed25519,
        bytes memory _ECDSA_secp256k1,
        address _delegatableContractId
    ) internal pure returns (IHederaTokenService.KeyValue memory){

        return IHederaTokenService.KeyValue({
            inheritAccountKey: _inheritAccountKey,
            contractId: _contractId,
            ed25519: _ed25519,
            ECDSA_secp256k1: _ECDSA_secp256k1,
            delegatableContractId: _delegatableContractId
        });

    }
}