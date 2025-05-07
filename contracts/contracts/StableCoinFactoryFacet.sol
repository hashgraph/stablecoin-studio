// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable-next-line max-line-length
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {HederaTokenManagerFacet, IHederaTokenManager} from './HederaTokenManagerFacet.sol';
import {HederaReserveFacet} from './HederaReserveFacet.sol';
import {IStableCoinFactory} from './Interfaces/IStableCoinFactory.sol';
import {Strings} from '@openzeppelin/contracts/utils/Strings.sol';
import {KeysLib} from './library/KeysLib.sol';
import {SafeCast} from '@openzeppelin/contracts/utils/math/SafeCast.sol';
import {AggregatorV3Interface} from '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';
import {ResolverProxy} from './resolver/resolverProxy/ResolverProxy.sol';
import {Common} from './core/Common.sol';
import {_STABLE_COIN_FACTORY_RESOLVER_KEY} from './constants/resolverKeys.sol';
import {IStaticFunctionSelectors} from './resolver/interfaces/resolverProxy/IStaticFunctionSelectors.sol';

contract StableCoinFactoryFacet is IStaticFunctionSelectors, IStableCoinFactory, Common {
    // Hedera HTS precompiled contract
    address private constant _PRECOMPILED_ADDRESS = address(0x167);
    string private constant _MEMO_1 = '{"p":"';
    string private constant _MEMO_2 = '"}';
    int64 private constant _DEFAULT_AUTO_RENEW_PERIOD = 90 days;

    /**
     * @dev Constructor required to avoid Initializer attack on logic contract
     */
    constructor() {
        _disableInitializers(_STABLE_COIN_FACTORY_RESOLVER_KEY);
    }

    function deployStableCoin(
        TokenStruct calldata requestedToken
    ) external payable override(IStableCoinFactory) returns (DeployedStableCoin memory) {
        address reserveAddress = _handleReserve(requestedToken);
        address stableCoinProxy = _deployStableCoinProxy(requestedToken);
        address tokenAddress = _initializeToken(requestedToken, stableCoinProxy, reserveAddress);

        DeployedStableCoin memory deployedStableCoin = DeployedStableCoin(
            stableCoinProxy,
            tokenAddress,
            reserveAddress
        );
        emit Deployed(deployedStableCoin);
        return deployedStableCoin;
    }

    /**
     * @dev Create a token with the given request
     *
     * @param requestedToken The token struct
     * @param stableCoinProxyAddress The address of the stablecoin proxy
     *
     * @return token The deployed token
     */
    function _createToken(
        TokenStruct memory requestedToken,
        address stableCoinProxyAddress
    ) private pure returns (IHederaTokenService.HederaToken memory) {
        // token Memo
        string memory tokenMemo = string(
            abi.encodePacked(_MEMO_1, Strings.toHexString(stableCoinProxyAddress), _MEMO_2)
        );

        // Token Expiry
        IHederaTokenService.Expiry memory tokenExpiry;
        tokenExpiry.autoRenewAccount = stableCoinProxyAddress;
        tokenExpiry.autoRenewPeriod = _DEFAULT_AUTO_RENEW_PERIOD;

        // Token Keys
        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](requestedToken.keys.length);
        for (uint256 i = 0; i < requestedToken.keys.length; i++) {
            keys[i] = IHederaTokenService.TokenKey({
                keyType: requestedToken.keys[i].keyType,
                key: KeysLib.generateKey(
                    requestedToken.keys[i].publicKey,
                    stableCoinProxyAddress,
                    requestedToken.keys[i].isEd25519
                )
            });
        }

        IHederaTokenService.HederaToken memory token = IHederaTokenService.HederaToken(
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
        uint32 _tokenDecimals = SafeCast.toUint32(SafeCast.toUint256(tokenDecimals));
        uint256 _tokenInitialSupply = SafeCast.toUint256(tokenInitialSupply);

        if (_tokenDecimals > reserveDecimals) {
            initialReserve = initialReserve * (10 ** (_tokenDecimals - reserveDecimals));
        } else {
            _tokenInitialSupply = _tokenInitialSupply * (10 ** (reserveDecimals - _tokenDecimals));
        }
        if (initialReserve < _tokenInitialSupply) revert LessThan(initialReserve, _tokenInitialSupply);
    }

    /**
     * @dev Handle reserve information if present
     *
     * @param requestedToken The token struct
     *
     * @return reserve address
     */
    function _handleReserve(TokenStruct calldata requestedToken) private returns (address) {
        bool createReserve = requestedToken.createReserve;
        address reserveAddress = requestedToken.reserveAddress;
        if (!createReserve && reserveAddress == address(0)) {
            return address(0);
        }

        if (createReserve) {
            HederaReserveFacet reserveContract = new HederaReserveFacet();
            _validationReserveInitialAmount(
                reserveContract.decimals(),
                requestedToken.reserveInitialAmount,
                requestedToken.tokenDecimals,
                requestedToken.tokenInitialSupply
            );
            address reserveProxy = address(
                new ResolverProxy(
                    requestedToken.businessLogicResolverAddress,
                    requestedToken.reserveConfigurationId.key,
                    requestedToken.reserveConfigurationId.version,
                    requestedToken.roles
                )
            );
            HederaReserveFacet(reserveProxy).initialize(requestedToken.reserveInitialAmount, msg.sender);
            return reserveProxy;
        }

        (, int256 reserveInitialAmount, , , ) = AggregatorV3Interface(reserveAddress).latestRoundData();
        _validationReserveInitialAmount(
            AggregatorV3Interface(reserveAddress).decimals(),
            reserveInitialAmount,
            requestedToken.tokenDecimals,
            requestedToken.tokenInitialSupply
        );
        return reserveAddress;
    }

    /**
     * @dev Deploy stable coin proxy
     *
     * @param requestedToken The token struct
     *
     * @return resolver proxy address
     */
    function _deployStableCoinProxy(TokenStruct calldata requestedToken) private returns (address) {
        return
            address(
                new ResolverProxy(
                    requestedToken.businessLogicResolverAddress,
                    requestedToken.stableCoinConfigurationId.key,
                    requestedToken.stableCoinConfigurationId.version,
                    requestedToken.roles
                )
            );
    }

    /**
     * @dev Initialize the stable coin token
     *
     * @param requestedToken The token struct
     * @param stableCoinProxy Stable Coin Proxy address
     * @param reserveAddress Reserve address
     *
     * @return hedera token manager address
     */
    function _initializeToken(
        TokenStruct calldata requestedToken,
        address stableCoinProxy,
        address reserveAddress
    ) private returns (address) {
        IHederaTokenService.HederaToken memory token = _createToken(requestedToken, stableCoinProxy);

        IHederaTokenManager.InitializeStruct memory initInfo = IHederaTokenManager.InitializeStruct(
            token,
            requestedToken.tokenInitialSupply,
            requestedToken.tokenDecimals,
            msg.sender,
            reserveAddress,
            requestedToken.roles,
            requestedToken.cashinRole,
            requestedToken.metadata
        );

        return HederaTokenManagerFacet(payable(stableCoinProxy)).initialize{value: msg.value}(initInfo);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _STABLE_COIN_FACTORY_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.deployStableCoin.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IStableCoinFactory).interfaceId;
    }
}
