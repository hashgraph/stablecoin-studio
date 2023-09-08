// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

import {
    IHederaTokenService
} from '@hashgraph/smart-contracts/contracts/hts-precompile/IHederaTokenService.sol';
import {
    HederaResponseCodes
} from '@hashgraph/smart-contracts/contracts/hts-precompile/HederaResponseCodes.sol';
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
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {
    AggregatorV3Interface
} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import {StableCoinProxyAdmin} from './proxies/StableCoinProxyAdmin.sol';

contract StableCoinFactory is IStableCoinFactory, Initializable {
    // Hedera HTS precompiled contract
    address private constant _PRECOMPILED_ADDRESS = address(0x167);
    string private constant _MEMO_1 = '{"p":"';
    string private constant _MEMO_2 = '","a":"';
    string private constant _MEMO_3 = '"}';
    int64 private constant _DEFAULT_AUTO_RENEW_PERIOD = 90 days;

    address private _admin;
    address[] private _hederaTokenManagerAddress;

    /**
     * @dev Constructor required to avoid Initializer attack on logic contract
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Checks if the calling account is the admin of the stablecoin
     *
     */
    modifier isAdmin() {
        if (_admin != msg.sender) revert OnlyAdministratorFunction(msg.sender);
        _;
    }

    /**
     * @dev Checks if an addres does not equals to the zero address
     *
     * @param addr The address to compare with the zero address
     */
    modifier checkAddressIsNotZero(address addr) {
        _checkAddressIsNotZero(addr);
        _;
    }

    /**
     * @dev Initialize the contract
     *
     * @param admin The address of the admin
     * @param hederaTokenManager The address of the hedera token manager
     */
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

    /**
     * @dev Deploys a stablecoin
     *
     * @param requestedToken The information provided to create the stablecoin's token
     * @param stableCoinContractAddress The address of the HederaTokenManager contract to create the stablecoin
     */
    function deployStableCoin(
        TokenStruct calldata requestedToken,
        address stableCoinContractAddress
    )
        external
        payable
        override(IStableCoinFactory)
        checkAddressIsNotZero(stableCoinContractAddress)
        returns (DeployedStableCoin memory)
    {
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
            (, int256 reserveInitialAmount, , , ) = AggregatorV3Interface(
                reserveAddress
            ).latestRoundData();

            _validationReserveInitialAmount(
                AggregatorV3Interface(reserveAddress).decimals(),
                reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );
        }

        // Deploy Proxy Admin
        StableCoinProxyAdmin stableCoinProxyAdmin;
        if (requestedToken.proxyAdminOwnerAccount != address(0)) {
            stableCoinProxyAdmin = new StableCoinProxyAdmin(
                requestedToken.proxyAdminOwnerAccount
            );
        } else {
            stableCoinProxyAdmin = new StableCoinProxyAdmin(msg.sender);
        }

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
                requestedToken.cashinRole,
                requestedToken.metadata
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

    /**
     * @dev Add a new stablecoin to contract addresses
     *
     * @param newAddress The new address
     */
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

    /**
     * @dev Get the stablecoin contract addresses
     *
     * @return The stablecoin contract addresses
     */
    function getHederaTokenManagerAddress()
        external
        view
        returns (address[] memory)
    {
        return _hederaTokenManagerAddress;
    }

    /**
     * @dev Edit a stablecoin contract address
     *
     * @param index The index of the address
     * @param newAddress The new address
     */
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

    /**
     * @dev Removes a stablecoin contract address
     *
     * @param index The index of the address
     */
    function removeHederaTokenManagerAddress(
        uint256 index
    ) external override(IStableCoinFactory) isAdmin {
        address addressRemoved = _hederaTokenManagerAddress[index];
        _edit(index, address(0));
        emit HederaTokenManagerAddressRemoved(index, addressRemoved);
    }

    /**
     * @dev Changes the admin address
     *
     * @param newAddress The new address
     */
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

    /**
     * @dev Gets the admin address
     *
     * @return The admin address
     */
    function getAdmin() external view returns (address) {
        return _admin;
    }

    /**
     * @dev Throws if the address is zero
     *
     * @param addr The address to validate
     */
    function _checkAddressIsNotZero(address addr) private pure {
        if (addr == address(0)) revert AddressZero(addr);
    }

    /**
     * @dev Create a token with the given request
     *
     * @param requestedToken The token struct
     * @param stableCoinProxyAddress The address of the stablecoin proxy
     * @param stableCoinProxyAdminAddress The address of the stablecoin proxy admin
     *
     * @return token The deployed token
     */
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
        tokenExpiry.autoRenewPeriod = _DEFAULT_AUTO_RENEW_PERIOD;

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

    /**
     * @dev Validate the reserve initial amount
     *
     * @param reserveDecimals The reserve decimals
     * @param reserveInitialAmount The reserve initial amount
     * @param tokenDecimals The token decimals
     * @param tokenInitialSupply The token initial supply
     */
    function _validationReserveInitialAmount(
        uint8 reserveDecimals,
        int256 reserveInitialAmount,
        int32 tokenDecimals,
        int64 tokenInitialSupply
    ) private pure {
        uint256 initialReserve = SafeCast.toUint256(reserveInitialAmount);
        uint32 _tokenDecimals = SafeCast.toUint32(
            SafeCast.toUint256(tokenDecimals)
        );
        uint256 _tokenInitialSupply = SafeCast.toUint256(tokenInitialSupply);

        if (_tokenDecimals > reserveDecimals) {
            initialReserve =
                initialReserve *
                (10 ** (_tokenDecimals - reserveDecimals));
        } else {
            _tokenInitialSupply =
                _tokenInitialSupply *
                (10 ** (reserveDecimals - _tokenDecimals));
        }
        if (initialReserve < _tokenInitialSupply)
            revert LessThan(initialReserve, _tokenInitialSupply);
    }

    /**
     * @dev Edit _hederaTokenManagerAddress array at the given index
     *
     * @param index The new index
     * @param newAddress The new address
     */
    function _edit(uint256 index, address newAddress) private {
        _hederaTokenManagerAddress[index] = newAddress;
    }
}
