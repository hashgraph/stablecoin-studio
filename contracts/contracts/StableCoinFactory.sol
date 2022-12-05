// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

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

    function deployStableCoin(tokenStruct calldata requestedToken) external payable override returns (address, address, address, address){

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
            requestedToken,
            address(StableCoinProxy)
        );
        
        // Initialize Proxy
        address tokenAddress = HederaERC20(address(StableCoinProxy)).initialize{value: msg.value}
            (
                token,
                requestedToken.tokenInitialSupply, 
                requestedToken.tokenDecimals,
                msg.sender
            );

        // Associate token
        if(treasuryIsContract(requestedToken.treasuryAddress))HederaERC20(address(StableCoinProxy)).associateToken(msg.sender);

        return (address(StableCoinProxy), address(StableCoinProxyAdmin), address(StableCoinContract), tokenAddress);
    }

    function createToken (
        tokenStruct memory requestedToken,
        address StableCoinProxyAddress
    ) 
    internal pure returns (IHederaTokenService.HederaToken memory){
        // token Memo
        string memory tokenMemo = Strings.toHexString(StableCoinProxyAddress);
        
        // Token Expiry
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = requestedToken.autoRenewAccountAddress;
        tokenExpiry.autoRenewPeriod = 7776000;

        // Token Keys
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](requestedToken.keys.length);
        for(uint i=0; i < requestedToken.keys.length; i++)
        {
            keys[i] = IHederaTokenService.TokenKey(
                    {
                        keyType: requestedToken.keys[i].keyType, 
                        key: generateKey(requestedToken.keys[i].PublicKey, StableCoinProxyAddress, requestedToken.keys[i].isED25519)
                    }
                );
        }

        IHederaTokenService.HederaToken memory token;
        token.name = requestedToken.tokenName;
        token.symbol = requestedToken.tokenSymbol;
        token.treasury = treasuryIsContract(requestedToken.treasuryAddress) ? 
            StableCoinProxyAddress 
            : requestedToken.treasuryAddress;
        token.memo = tokenMemo;
        token.tokenSupplyType = requestedToken.supplyType;
        token.maxSupply = requestedToken.tokenMaxSupply;
        token.freezeDefault = requestedToken.freeze;
        token.tokenKeys = keys;
        token.expiry = tokenExpiry;

        return token;
    }

    function generateKey(bytes memory PublicKey, address StableCoinProxyAddress, bool isED25519) internal pure returns(IHederaTokenService.KeyValue memory)
    {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory Key;
        if(PublicKey.length == 0) Key.delegatableContractId = StableCoinProxyAddress;
        else if(isED25519) Key.ed25519 = PublicKey;
        else Key.ECDSA_secp256k1 = PublicKey;

        return Key;
    }

    function treasuryIsContract(address treasuryAddress) internal pure returns(bool)
    {
        return treasuryAddress == address(0);
    }
}