// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ResolverProxyUnstructured} from '../../resolver/resolverProxy/unstructured/ResolverProxyUnstructured.sol';
import {IResolverProxy} from '../../resolver/interfaces/resolverProxy/IResolverProxy.sol';
import {IBusinessLogicResolver} from '../../resolver/interfaces/IBusinessLogicResolver.sol';
import {RolesStruct} from '../../Interfaces/IHederaTokenManager.sol';
import {_MIGRATION_IMPLEMENTATION_PROXY_V2_RESOLVER_KEY} from './../../constants/resolverKeys.sol';
import {Initializable} from './../../core/Initializable.sol';

contract MigrationImplementationProxy is Initializable, ResolverProxyUnstructured {
    constructor() {
        _disableInitializers(_MIGRATION_IMPLEMENTATION_PROXY_V2_RESOLVER_KEY);
    }

    // initialization to migrate transparent proxy (v1) to resolver proxy (v2)
    function initializeV2Migration(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        RolesStruct[] memory _roles
    ) external payable initializer(_MIGRATION_IMPLEMENTATION_PROXY_V2_RESOLVER_KEY) {
        _initialize(_resolver, _resolverProxyConfigurationId, _version, _roles);
    }

    receive() external payable {}

    // Find facet for function that is called and execute the
    // function if a facet is found and return any value.
    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        // get facet from function selector
        address facet = _getFacetAddress(_resolverProxyStorage(), msg.sig);
        if (facet == address(0)) {
            revert IResolverProxy.FunctionNotFound(msg.sig);
        }
        // Execute external function from facet using delegatecall and return any value.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            // copy function selector and any arguments
            calldatacopy(0, 0, calldatasize())
            // execute function call using the facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            // get any return value
            returndatacopy(0, 0, returndatasize())
            // return any return value or error back to the caller
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
