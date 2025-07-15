// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ResolverProxyFallBack} from '../../resolver/resolverProxy/ResolverProxy.sol';
import {IBusinessLogicResolver} from '../../resolver/interfaces/IBusinessLogicResolver.sol';
import {RolesStruct} from '../../Interfaces/IHederaTokenManager.sol';
import {_MIGRATION_PROXY_V2_RESOLVER_KEY} from './../../constants/resolverKeys.sol';
import {Initializable} from './../../core/Initializable.sol';

contract MigrationProxy is Initializable, ResolverProxyFallBack {
    constructor() {
        _disableInitializers(_MIGRATION_PROXY_V2_RESOLVER_KEY);
    }

    // initialization to migrate transparent proxy (v1) to resolver proxy (v2)
    function initializeV2Migration(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        RolesStruct[] memory _roles
    ) external payable initializer(_MIGRATION_PROXY_V2_RESOLVER_KEY) {
        _initialize(_resolver, _resolverProxyConfigurationId, _version, _roles);
    }
}
