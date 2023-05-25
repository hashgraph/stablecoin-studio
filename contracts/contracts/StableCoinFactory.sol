// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {IHederaTokenService} from './hts-precompile/IHederaTokenService.sol';
import {HederaResponseCodes} from './hts-precompile/HederaResponseCodes.sol';
import {
    HederaTokenManager,
    IHederaTokenManager
} from './HederaTokenManager.sol';
import {
    TransparentUpgradeableProxy
} from '@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol';
import {
    ProxyAdmin
} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {HederaReserve} from './HederaReserve.sol';
import {IStableCoinFactory} from './Interfaces/IStableCoinFactory.sol';
import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import {
    Initializable
} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {KeysLib} from './library/KeysLib.sol';

contract StableCoinFactory is
    IStableCoinFactory,
    HederaResponseCodes,
    Initializable
{
    // Hedera HTS precompiled contract
    address private constant _PRECOMPILED_ADDRESS = address(0x167);
    string private constant _MEMO_1 = '{"p":"';
    string private constant _MEMO_2 = '","a":"';
    string private constant _MEMO_3 = '"}';
    int64 private constant _DFAULT_AUTO_RENEW_PERIOD = 90 days;

    address private _admin;
    address[] private _hederaTokenManagerAddress;

    modifier isAdmin() {
        require(
            _admin == msg.sender,
            'Only administrator can call this function'
        );
        _;
    }

    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    function _checkAddressIsNotZero(address addr) private pure {
        require(addr != address(0), 'Provided address is 0');
    }

    function initialize(
        address admin,
        address hederaTokenManager
    )
        external
        initializer
        checkAddressIsNotZero(admin)
        checkAddressIsNotZero(hederaTokenManager)
    {
        _admin = admin;
        _hederaTokenManagerAddress.push(hederaTokenManager);
        emit StableCoinFactoryInitialized();
    }

    // Constructor required to avoid Initializer attack on logic contract
    constructor() {
        _disableInitializers();
    }

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
        address reserveProxy;
        address reserveProxyAdmin;

        if (requestedToken.createReserve) {
            HederaReserve reserveContract = new HederaReserve();
            _validationReserveInitialAmount(
                reserveContract.decimals(),
                requestedToken.reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );

            reserveProxyAdmin = address(new ProxyAdmin());
            ProxyAdmin(reserveProxyAdmin).transferOwnership(msg.sender);
            reserveProxy = address(
                new TransparentUpgradeableProxy(
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
        ProxyAdmin stableCoinProxyAdmin = new ProxyAdmin();

        // Transfer Proxy Admin ownership
        stableCoinProxyAdmin.transferOwnership(msg.sender);

        // Deploy Proxy
        TransparentUpgradeableProxy stableCoinProxy = new TransparentUpgradeableProxy(
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
        IHederaTokenManager.InitializeStruct
            memory initInfo = IHederaTokenManager.InitializeStruct(
                token,
                requestedToken.tokenInitialSupply,
                requestedToken.tokenDecimals,
                msg.sender,
                reserveAddress,
                requestedToken.roles,
                requestedToken.cashinRole
            );

        address tokenAddress = HederaTokenManager(address(stableCoinProxy))
            .initialize{value: msg.value}(initInfo);

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
        tokenExpiry.autoRenewAccount = stableCoinProxyAddress;
        tokenExpiry.autoRenewPeriod = _DFAULT_AUTO_RENEW_PERIOD;

        // Token Keys
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](
                requestedToken.keys.length
            );
        for (uint256 i = 0; i < requestedToken.keys.length; i++) {
            keys[i] = IHederaTokenService.TokenKey({
                keyType: requestedToken.keys[i].keyType,
                key: KeysLib.generateKey(
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
                stableCoinProxyAddress,
                tokenMemo,
                requestedToken.supplyType,
                requestedToken.tokenMaxSupply,
                requestedToken.freeze,
                keys,
                tokenExpiry
            );

        return token;
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

    function addHederaTokenManagerVersion(
        address newAddress
    )
        external
        override(IStableCoinFactory)
        isAdmin
        checkAddressIsNotZero(newAddress)
    {
        _hederaTokenManagerAddress.push(newAddress);
        emit HederaTokenManagerAddressAdded(newAddress);
    }

    function getHederaTokenManagerAddress()
        external
        view
        returns (address[] memory)
    {
        return _hederaTokenManagerAddress;
    }

    function editHederaTokenManagerAddress(
        uint256 index,
        address newAddress
    )
        external
        override(IStableCoinFactory)
        isAdmin
        checkAddressIsNotZero(newAddress)
    {
        address oldAddress = _hederaTokenManagerAddress[index];
        _edit(index, newAddress);
        emit HederaTokenManagerAddressEdited(oldAddress, newAddress);
    }

    function _edit(uint256 index, address newAddress) private {
        _hederaTokenManagerAddress[index] = newAddress;
    }

    function removeHederaTokenManagerAddress(
        uint256 index
    ) external override(IStableCoinFactory) isAdmin {
        address addressRemoved = _hederaTokenManagerAddress[index];
        _edit(index, address(0));
        emit HederaTokenManagerAddressRemoved(index, addressRemoved);
    }

    function changeAdmin(
        address newAddress
    )
        external
        override(IStableCoinFactory)
        isAdmin
        checkAddressIsNotZero(newAddress)
    {
        address oldAdmin = _admin;
        _admin = newAddress;
        emit AdminChanged(oldAdmin, newAddress);
    }

    function getAdmin() external view returns (address) {
        return _admin;
    }
}
