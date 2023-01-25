// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import './hts-precompile/IHederaTokenService.sol';
import './hts-precompile/HederaResponseCodes.sol';
import './HederaERC20.sol';
import './HederaERC20Proxy.sol';
import './HederaERC20ProxyAdmin.sol';
import './HederaReserve.sol';
import './HederaReserveProxy.sol';
import './HederaReserveProxyAdmin.sol';
import './Interfaces/IStableCoinFactory.sol';
import './Interfaces/IHederaERC20.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

contract StableCoinFactory is IStableCoinFactory, HederaResponseCodes {
    // Hedera HTS precompiled contract
    address private constant PRECOMPILED_ADDRESS = address(0x167);
    string private constant MEMO_1 = '{"p":"';
    string private constant MEMO_2 = '","a":"';
    string private constant MEMO_3 = '"}';

    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    ) external 
    payable override(IStableCoinFactory) returns (DeployedStableCoin memory) {
        // Check that the provided Stable Coin implementacion address is not 0
        require(stableCoinContractAddress != address(0), "Provided Stable Coin Contract Address is 0");

        // Reserve
        address reserveAddress = requestedToken.reserveAddress;
        address reserveProxy = address(0);
        address reserveProxyAdmin = address(0);

        if (requestedToken.createReserve) {
            HederaReserve reserveContract = new HederaReserve();
            validationReserveInitialAmount(
                reserveContract.decimals(),
                requestedToken.reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );

            reserveProxyAdmin = address(new HederaReserveProxyAdmin());
            HederaReserveProxyAdmin(reserveProxyAdmin).transferOwnership(msg.sender);
            reserveProxy = address(new HederaReserveProxy(
                address(reserveContract),
                address(reserveProxyAdmin),
                ''
            ));

            HederaReserve(reserveProxy).initialize(
                requestedToken.reserveInitialAmount,
                msg.sender
            );
            reserveAddress = reserveProxy;
        }
        else if(reserveAddress != address(0)){
            (, int256 reserveInitialAmount, , , ) = HederaReserve(reserveAddress)
                .latestRoundData();

            validationReserveInitialAmount(
                HederaReserve(reserveAddress).decimals(),
                reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );
        }

        // Deploy Proxy Admin
        HederaERC20ProxyAdmin stableCoinProxyAdmin = new HederaERC20ProxyAdmin();

        // Transfer Proxy Admin ownership
        stableCoinProxyAdmin.transferOwnership(msg.sender);

        // Deploy Proxy
        HederaERC20Proxy StableCoinProxy = new HederaERC20Proxy(
            stableCoinContractAddress,
            address(stableCoinProxyAdmin),
            ''
        );

        // Create Token
        IHederaTokenService.HederaToken memory token = createToken(
            requestedToken,
            address(StableCoinProxy),
            address(stableCoinProxyAdmin)
        );

        // Initialize Proxy
        IHederaERC20.InitializeStruct memory initInfo;
        initInfo.token = token;
        initInfo.initialTotalSupply = requestedToken.tokenInitialSupply;
        initInfo.tokenDecimals = requestedToken.tokenDecimals;
        initInfo.originalSender = msg.sender;
        initInfo.reserveAddress = reserveAddress;
        initInfo.grantKYCToOriginalSender = requestedToken.grantKYCToOriginalSender;
        initInfo.treasuryIsContract = treasuryIsContract(requestedToken.treasuryAddress);

        address tokenAddress = HederaERC20(address(StableCoinProxy)).initialize{
            value: msg.value
        }(
            initInfo
        );

        // Return event
        DeployedStableCoin memory deployedStableCoin;

        deployedStableCoin.stableCoinProxy = address(StableCoinProxy);
        deployedStableCoin.stableCoinProxyAdmin = address(stableCoinProxyAdmin);
        deployedStableCoin
            .stableCoinContractAddress = stableCoinContractAddress;
        deployedStableCoin.tokenAddress = tokenAddress;
        deployedStableCoin.reserveProxy = reserveAddress;
        deployedStableCoin.reserveProxyAdmin = reserveProxyAdmin;

        emit Deployed(deployedStableCoin);

        return deployedStableCoin;
    }

    function createToken(
        TokenStruct memory requestedToken,
        address stableCoinProxyAddress,
        address stableCoinProxyAdminAddress
    ) private pure returns (IHederaTokenService.HederaToken memory) {
        // token Memo
        string memory tokenMemo = string(
            abi.encodePacked(
                MEMO_1,
                Strings.toHexString(stableCoinProxyAddress),
                MEMO_2,
                Strings.toHexString(stableCoinProxyAdminAddress),
                MEMO_3
            )
        );

        // Token Expiry
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = requestedToken.autoRenewAccountAddress;
        tokenExpiry.autoRenewPeriod = 7776000;

        // Token Keys
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](
                requestedToken.keys.length
            );
        for (uint256 i = 0; i < requestedToken.keys.length; i++) {
            keys[i] = IHederaTokenService.TokenKey({
                keyType: requestedToken.keys[i].keyType,
                key: generateKey(
                    requestedToken.keys[i].PublicKey,
                    stableCoinProxyAddress,
                    requestedToken.keys[i].isED25519
                )
            });
        }

        IHederaTokenService.HederaToken memory token;
        token.name = requestedToken.tokenName;
        token.symbol = requestedToken.tokenSymbol;
        token.treasury = treasuryIsContract(requestedToken.treasuryAddress)
            ? stableCoinProxyAddress
            : requestedToken.treasuryAddress;
        token.memo = tokenMemo;
        token.tokenSupplyType = requestedToken.supplyType;
        token.maxSupply = requestedToken.tokenMaxSupply;
        token.freezeDefault = requestedToken.freeze;
        token.tokenKeys = keys;
        token.expiry = tokenExpiry;

        return token;
    }

    function generateKey(
        bytes memory publicKey,
        address stableCoinProxyAddress,
        bool isED25519
    ) private pure returns (IHederaTokenService.KeyValue memory) {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory Key;
        if (publicKey.length == 0)
            Key.delegatableContractId = stableCoinProxyAddress;
        else if (isED25519) Key.ed25519 = publicKey;
        else Key.ECDSA_secp256k1 = publicKey;

        return Key;
    }

    function treasuryIsContract(
        address treasuryAddress
    ) private pure returns (bool) {
        return treasuryAddress == address(0);
    }

    function validationReserveInitialAmount(
        uint8 reserveDecimals,
        int256 reserveInitialAmount,
        uint32 tokenDecimals,
        uint256 tokenInitialSupply
    ) private pure {
        //Validate initial reserve amount
        require(
            reserveInitialAmount >= 0,
            'Reserve initial amount must be positive'
        );
        uint256 initialReserve = uint(reserveInitialAmount);
        if (tokenDecimals > reserveDecimals) {
            initialReserve =
                initialReserve *
                (10 ** (tokenDecimals - reserveDecimals));
        } else {
            tokenInitialSupply =
                tokenInitialSupply *
                (10 ** (reserveDecimals - tokenDecimals));
        }
        require(
            tokenInitialSupply <= initialReserve,
            'Initial supply is lower than initial reserve'
        );
    }
}
