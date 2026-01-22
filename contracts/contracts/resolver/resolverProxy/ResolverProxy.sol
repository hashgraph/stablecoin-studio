// SPDX-License-Identifier: MIT
// solhint-disable-next-line one-contract-per-file
pragma solidity 0.8.18;

import {ResolverProxyUnstructured} from './unstructured/ResolverProxyUnstructured.sol';
import {IResolverProxy} from '../interfaces/resolverProxy/IResolverProxy.sol';
import {IBusinessLogicResolver} from '../interfaces/IBusinessLogicResolver.sol';
import {RolesStruct} from '../../Interfaces/IHederaTokenManager.sol';

contract ResolverProxyFallBack is ResolverProxyUnstructured {
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

contract ResolverProxy is ResolverProxyFallBack {
    constructor(
        IBusinessLogicResolver _resolver,
        bytes32 _resolverProxyConfigurationId,
        uint256 _version,
        RolesStruct[] memory _roles
    ) payable {
        _initialize(_resolver, _resolverProxyConfigurationId, _version, _roles);
    }
}
