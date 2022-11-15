// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./hts-precompile/IHederaTokenService.sol";
import "./hts-precompile/HederaResponseCodes.sol";
import "./HederaERC20.sol";
import "./HederaERC20Proxy.sol";
import "./HederaERC20ProxyAdmin.sol";
import "./Interfaces/IStableCoinFactory.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract StableCoinFactory is IStableCoinFactory, HederaResponseCodes{

    // Hedera HTS precompiled contract
    address constant precompileAddress = address(0x167);
    string constant memo_1 = "({proxyContract: ";
    string constant memo_2 = "})";

    function deployStableCoin(tokenStruct calldata requestedToken) external payable override returns (address, address, address){

        // Deploy logic contract
        HederaERC20 StableCoinContract = new HederaERC20();

        // Deploy Proxy Admin
        HederaERC20ProxyAdmin StableCoinProxyAdmin = new HederaERC20ProxyAdmin();

        // Transfer Proxy Admin ownership
        StableCoinProxyAdmin.transferOwnership(msg.sender);

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
            requestedToken.keys
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

        return (address(StableCoinProxy), address(StableCoinProxyAdmin), address(StableCoinContract));
    }

    function createToken (string memory tokenName,
        string memory tokenSymbol,
        bool freeze,
        bool supplyType,
        uint32 tokenMaxSupply,
        address StableCoinProxyAddress,
        KeysStruct[] memory keysToDefine
    ) 
    internal view returns (IHederaTokenService.HederaToken memory){
        // token Memo
        string memory tokenMemo = string(abi.encodePacked(memo_1, Strings.toHexString(StableCoinProxyAddress), memo_2));
        
        // Token Expiry
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = msg.sender;
        tokenExpiry.autoRenewPeriod = 7776000;

        // Token Keys
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](keysToDefine.length);
        for(uint i=0; i < keysToDefine.length; i++)
        {
            keys[i] = IHederaTokenService.TokenKey(
                    {
                        keyType: keysToDefine[i].keyType, 
                        key: generateKey(keysToDefine[i].PublicKey, StableCoinProxyAddress)
                    }
                );
        }

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

    function generateKey(bytes memory PublicKey, address StableCoinProxyAddress) internal pure returns(IHederaTokenService.KeyValue memory)
    {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory Key;
        if(PublicKey.length == 0) Key.delegatableContractId = StableCoinProxyAddress;
        else Key.ed25519 = PublicKey;

        return Key;
    }
}