// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/HederaResponseCodes.sol";
import "./HederaERC20.sol";
import "./HederaERC20Proxy.sol";
import "./HederaERC20ProxyAdmin.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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

        // Deploy Proxy Admin
        HederaERC20ProxyAdmin StableCoinProxyAdmin = new HederaERC20ProxyAdmin();

        // Deploy Proxy
        HederaERC20Proxy StableCoinProxy = new HederaERC20Proxy(
            address(StableCoinContract), 
            address(StableCoinProxyAdmin), 
            "");

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
        HederaERC20(address(StableCoinProxy)).initialize(tokenAddress, msg.sender);

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

        string memory tokenMemo = string(abi.encodePacked(memo_1, Strings.toHexString(StableCoinProxyAddress), memo_2));
        
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = msg.sender;
        tokenExpiry.autoRenewPeriod = 7776000;

        IHederaTokenService.KeyValue memory SenderKey;
        SenderKey.ed25519 = senderPublicKey;

        IHederaTokenService.KeyValue memory ProxyKey;
        SenderKey.delegatableContractId = StableCoinProxyAddress;
        
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](4);
        keys[0] = IHederaTokenService.TokenKey({keyType: 1, key: SenderKey}); // admin
        keys[1] = IHederaTokenService.TokenKey({keyType: 4, key: SenderKey}); // freeze
        keys[2] = IHederaTokenService.TokenKey({keyType: 8, key: ProxyKey}); // wipe
        keys[3] = IHederaTokenService.TokenKey({keyType: 16, key: ProxyKey}); // supply

        IHederaTokenService.HederaToken memory token;
        token.name = tokenName;
        token.symbol = tokenSymbol;
        token.treasury = StableCoinProxyAddress;
        token.memo = tokenMemo;
        token.tokenSupplyType = supplyType;
        token.maxSupply = tokenMaxSupply;
        token.freezeDefault = freeze;
        token.tokenKeys = keys;
        token.expiry = tokenExpiry;

        return token;
    }
}