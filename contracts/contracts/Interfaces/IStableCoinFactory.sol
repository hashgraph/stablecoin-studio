// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IHederaTokenManager, RolesStruct} from './IHederaTokenManager.sol';
import {KeysStruct} from '../library/KeysLib.sol';
import {IBusinessLogicResolver} from '../resolver/interfaces/IBusinessLogicResolver.sol';

interface IStableCoinFactory {
    struct ResolverProxyConfiguration {
        bytes32 key;
        uint256 version;
    }

    struct TokenStruct {
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        int64 tokenMaxSupply;
        int64 tokenInitialSupply;
        int32 tokenDecimals;
        address reserveAddress;
        int256 reserveInitialAmount;
        bool createReserve;
        KeysStruct[] keys;
        RolesStruct[] roles;
        IHederaTokenManager.CashinRoleStruct cashinRole;
        string metadata;
        IBusinessLogicResolver businessLogicResolverAddress;
        ResolverProxyConfiguration stableCoinConfigurationId;
        ResolverProxyConfiguration reserveConfigurationId;
    }

    struct DeployedStableCoin {
        address stableCoinProxy;
        address tokenAddress;
        address reserveProxy;
    }

    /**
     * @dev Emitted when a new stablecoin is deployed
     *
     * @param deployedStableCoin The new deployed stablecoin
     */
    event Deployed(DeployedStableCoin deployedStableCoin);

    /**
     * @dev Emitted when a stablecoin factory is initialized
     *
     */
    event StableCoinFactoryInitialized();

    /**
     * @dev Deploys a stablecoin
     *
     * @param requestedToken The information provided to create the stablecoin's token
     */
    function deployStableCoin(TokenStruct calldata requestedToken) external payable returns (DeployedStableCoin memory);
}
