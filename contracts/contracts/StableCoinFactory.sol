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
import '@openzeppelin/contracts/utils/Strings.sol';

contract StableCoinFactory is IStableCoinFactory, HederaResponseCodes {
    // Hedera HTS precompiled contract
    address private constant _PRECOMPILED_ADDRESS = address(0x167);
    string private constant _MEMO_1 = '{"p":"';
    string private constant _MEMO_2 = '","a":"';
    string private constant _MEMO_3 = '"}';

    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    )
        external
        payable
        override(IStableCoinFactory)
        returns (DeployedStableCoin memory)
    {
        // Check that the provided Stable Coin implementacion address is not 0
        require(
            stableCoinContractAddress != address(0),
            'Provided Stable Coin Contract Address is 0'
        );

        // Reserve
        address reserveAddress = requestedToken.reserveAddress;
        address reserveProxy = address(0);
        address reserveProxyAdmin = address(0);

        if (requestedToken.createReserve) {
            HederaReserve reserveContract = new HederaReserve();
            _validationReserveInitialAmount(
                reserveContract.decimals(),
                requestedToken.reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );

            reserveProxyAdmin = address(new HederaReserveProxyAdmin());
            HederaReserveProxyAdmin(reserveProxyAdmin).transferOwnership(
                msg.sender
            );
            reserveProxy = address(
                new HederaReserveProxy(
                    address(reserveContract),
                    address(reserveProxyAdmin),
                    ''
                )
            );

            HederaReserve(reserveProxy).initialize(
                requestedToken.reserveInitialAmount,
                msg.sender
            );
            reserveAddress = reserveProxy;
        } else if (reserveAddress != address(0)) {
            (, int256 reserveInitialAmount, , , ) = HederaReserve(
                reserveAddress
            ).latestRoundData();

            _validationReserveInitialAmount(
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
        HederaERC20Proxy stableCoinProxy = new HederaERC20Proxy(
            stableCoinContractAddress,
            address(stableCoinProxyAdmin),
            ''
        );

        // Create Token
        IHederaTokenService.HederaToken memory token = _createToken(
            requestedToken,
            address(stableCoinProxy),
            address(stableCoinProxyAdmin)
        );

        // Initialize Proxy
        IHederaERC20.InitializeStruct memory initInfo = IHederaERC20
            .InitializeStruct(
                token,
                requestedToken.tokenInitialSupply,
                requestedToken.tokenDecimals,
                msg.sender,
                reserveAddress,
                requestedToken.grantKYCToOriginalSender,
                _treasuryIsContract(requestedToken.treasuryAddress),
                requestedToken.roles,
                requestedToken.cashinRole
            );

        address tokenAddress = HederaERC20(address(stableCoinProxy)).initialize{
            value: msg.value
        }(initInfo);

        // Return event
        DeployedStableCoin memory deployedStableCoin = DeployedStableCoin(
            address(stableCoinProxy),
            address(stableCoinProxyAdmin),
            stableCoinContractAddress,
            tokenAddress,
            reserveAddress,
            reserveProxyAdmin
        );

        emit Deployed(deployedStableCoin);

        return deployedStableCoin;
    }

    function _createToken(
        TokenStruct memory requestedToken,
        address stableCoinProxyAddress,
        address stableCoinProxyAdminAddress
    ) private pure returns (IHederaTokenService.HederaToken memory) {
        // token Memo
        string memory tokenMemo = string(
            abi.encodePacked(
                _MEMO_1,
                Strings.toHexString(stableCoinProxyAddress),
                _MEMO_2,
                Strings.toHexString(stableCoinProxyAdminAddress),
                _MEMO_3
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
                key: _generateKey(
                    requestedToken.keys[i].publicKey,
                    stableCoinProxyAddress,
                    requestedToken.keys[i].isED25519
                )
            });
        }

        IHederaTokenService.HederaToken memory token = IHederaTokenService
            .HederaToken(
                requestedToken.tokenName,
                requestedToken.tokenSymbol,
                _treasuryIsContract(requestedToken.treasuryAddress)
                    ? stableCoinProxyAddress
                    : requestedToken.treasuryAddress,
                tokenMemo,
                requestedToken.supplyType,
                requestedToken.tokenMaxSupply,
                requestedToken.freeze,
                keys,
                tokenExpiry
            );

        return token;
    }

    function _generateKey(
        bytes memory publicKey,
        address stableCoinProxyAddress,
        bool isED25519
    ) private pure returns (IHederaTokenService.KeyValue memory) {
        // If the Public Key is empty we assume the user has chosen the proxy
        IHederaTokenService.KeyValue memory key;
        if (publicKey.length == 0)
            key.delegatableContractId = stableCoinProxyAddress;
        else if (isED25519) key.ed25519 = publicKey;
        else key.ECDSA_secp256k1 = publicKey;

        return key;
    }

    function _treasuryIsContract(
        address treasuryAddress
    ) private pure returns (bool) {
        return treasuryAddress == address(0);
    }

    function _validationReserveInitialAmount(
        uint8 reserveDecimals,
        int256 reserveInitialAmount,
        int32 tokenDecimals,
        int64 tokenInitialSupply
    ) private pure {
        require(
            reserveInitialAmount >= 0,
            'Reserve Initial supply must be at least 0'
        );

        uint256 initialReserve = uint256(reserveInitialAmount);
        uint32 _tokenDecimals = uint32(tokenDecimals);
        uint256 _tokenInitialSupply = uint256(uint64(tokenInitialSupply));

        if (_tokenDecimals > reserveDecimals) {
            initialReserve =
                initialReserve *
                (10 ** (_tokenDecimals - reserveDecimals));
        } else {
            _tokenInitialSupply =
                _tokenInitialSupply *
                (10 ** (reserveDecimals - _tokenDecimals));
        }
        require(
            _tokenInitialSupply <= initialReserve,
            'Initial supply is lower than initial reserve'
        );
    }
}
