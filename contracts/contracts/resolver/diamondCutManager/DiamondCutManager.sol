// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ADMIN_ROLE} from '../../constants/roles.sol';
import {RolesStorageWrapper} from '../../extensions/RolesStorageWrapper.sol';
import {DiamondCutManagerWrapper} from './DiamondCutManagerWrapper.sol';
import {IResolverLoupe} from '../interfaces/resolverProxy/IResolverLoupe.sol';

abstract contract DiamondCutManager is RolesStorageWrapper, DiamondCutManagerWrapper {
    modifier validateConfigurationId(bytes32 _configurationId) {
        _checkConfigurationId(_configurationId);
        _;
    }

    function createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) external override validateConfigurationId(_configurationId) onlyRole(ADMIN_ROLE) {
        emit DiamondConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _createConfiguration(_configurationId, _facetConfigurations)
        );
    }

    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) external override validateConfigurationId(_configurationId) onlyRole(ADMIN_ROLE) {
        emit DiamondBatchConfigurationCreated(
            _configurationId,
            _facetConfigurations,
            _isLastBatch,
            _createBatchConfiguration(_configurationId, _facetConfigurations, _isLastBatch)
        );
    }

    function cancelBatchConfiguration(
        bytes32 _configurationId
    ) external override validateConfigurationId(_configurationId) onlyRole(ADMIN_ROLE) {
        _cancelBatchConfiguration(_configurationId);
        emit DiamondBatchConfigurationCanceled(_configurationId);
    }

    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _resolveResolverProxyCall(_diamondCutManagerStorage(), _configurationId, _version, _selector);
    }

    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view override returns (bool exists_) {
        exists_ = _resolveSupportsInterface(_diamondCutManagerStorage(), _configurationId, _version, _interfaceId);
    }

    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override returns (bool isRegistered_) {
        isRegistered_ = _isResolverProxyConfigurationRegistered(
            _diamondCutManagerStorage(),
            _configurationId,
            _version
        );
    }

    function checkResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view override {
        _checkResolverProxyConfigurationRegistered(_diamondCutManagerStorage(), _configurationId, _version);
    }

    function getConfigurationsLength() external view override returns (uint256 configurationsLength_) {
        configurationsLength_ = _diamondCutManagerStorage().configurations.length;
    }

    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _getConfigurations(_diamondCutManagerStorage(), _pageIndex, _pageLength);
    }

    function getLatestVersionByConfiguration(
        bytes32 _configurationId
    ) external view override returns (uint256 latestVersion_) {
        latestVersion_ = _diamondCutManagerStorage().latestVersion[_configurationId];
    }

    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view override returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLengthByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version
        );
    }

    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (IResolverLoupe.ResolverFacet[] memory facets_) {
        facets_ = _getFacetsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view override returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _getFacetSelectorsByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIdsByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = _getFacetAddressesByConfigurationIdAndVersion(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _pageIndex,
            _pageLength
        );
    }

    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view override returns (bytes32 facetId_) {
        facetId_ = _getFacetIdByConfigurationIdVersionAndSelector(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _selector
        );
    }

    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view override returns (IResolverLoupe.ResolverFacet memory facet_) {
        facet_ = _getFacetByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddressByConfigurationIdVersionAndFacetId(
            _diamondCutManagerStorage(),
            _configurationId,
            _version,
            _facetId
        );
    }

    function _checkConfigurationId(bytes32 _configurationId) private pure {
        if (uint256(_configurationId) == 0) {
            revert DefaultValueForConfigurationIdNotPermitted();
        }
    }
}
