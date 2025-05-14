// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IDiamondCut} from '../../interfaces/resolverProxy/IDiamondCut.sol';
import {ResolverProxyUnstructured} from '../unstructured/ResolverProxyUnstructured.sol';
import {IBusinessLogicResolver} from '../../interfaces/IBusinessLogicResolver.sol';
import {_DIAMOND_CUT_RESOLVER_KEY} from '../../../constants/resolverKeys.sol';
import {ADMIN_ROLE} from '../../../constants/roles.sol';

contract DiamondCutFacet is IDiamondCut, ResolverProxyUnstructured {
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(ADMIN_ROLE) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(ds.resolverProxyConfigurationId, _newVersion);
        _updateVersion(ds, _newVersion);
    }

    function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external override onlyRole(ADMIN_ROLE) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(ADMIN_ROLE) {
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        _updateResolver(ds, _newResolver);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        return (address(ds.resolver), ds.resolverProxyConfigurationId, ds.version);
    }

    // This implements ERC-165.
    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DIAMOND_CUT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorIndex;
        unchecked {
            staticFunctionSelectors_[selectorIndex++] = this.updateConfigVersion.selector;
            staticFunctionSelectors_[selectorIndex++] = this.updateConfig.selector;
            staticFunctionSelectors_[selectorIndex++] = this.updateResolver.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getConfigInfo.selector;
        }
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondCut).interfaceId;
    }
}
