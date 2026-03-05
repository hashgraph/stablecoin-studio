// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IDiamondLoupe} from '../resolverProxy/IDiamondLoupe.sol';

/// @title Resolver Proxy Manager
/// @notice This contract is used to manage configurations of resolverProxy's.
///		 Each resolverProxy must have a resolverProxy configuration id. It could ask to the ResolverProxyCutManger by:
///      * Maintain the list of business logic that forms part of a resolverProxy configuration.
///      * Maintain and resolve the list of function selectors by each configuration knowing its business logic address.
///      * Maintain and resolve the list of interface ids by each configuration.
///      By each configurationId:
///      * latestVersion: number of versions registered.
///      * Version: Each version registered contains
///        * Version number.
///        * A list of facets
///          * facetId
///          * list of selectors
///          * list of interfaceIds
interface IDiamondCutManager {
    struct FacetConfiguration {
        bytes32 id;
        uint256 version;
    }

    /// @notice emited when createConfiguration is executed
    event DiamondConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        uint256 version
    );

    /// @notice emited when createBatchConfiguration is executed
    event DiamondBatchConfigurationCreated(
        bytes32 configurationId,
        FacetConfiguration[] facetConfigurations,
        bool _isLastBatch,
        uint256 version
    );

    /// @notice emited when cancelBatchConfiguration is executed
    event DiamondBatchConfigurationCanceled(bytes32 configurationId);

    // @notice Not able to use bytes32(0) with configurationId
    error DefaultValueForConfigurationIdNotPermitted();

    /// @notice Not able to use a facetId unregistered
    error FacetIdNotRegistered(bytes32 configurationId, bytes32 facetId);

    /// @notice Not able to duplicate facetId in list
    error DuplicatedFacetInConfiguration(bytes32 facetId);

    /// @notice error that occurs when try to create a configuration and the configuration key doesn't exists
    error ResolverProxyConfigurationNoRegistered(bytes32 resolverProxyConfigurationId, uint256 version);

    /// @notice error that occurs when try to add a selector and the selector is blacklisted
    error SelectorBlacklisted(bytes4 selector);

    /// @notice error that occurs when defining a configuration with an empty facet array list
    error EmptyConfiguration();

    /// @notice Create a new configuration to the latest version of all facets.
    /// @param _configurationId unused identifier to the configuration.
    /// @param _facetConfigurations.id list of business logics to be registered.
    /// @param _facetConfigurations.version list of versions of each _facetIds.
    function createConfiguration(bytes32 _configurationId, FacetConfiguration[] calldata _facetConfigurations) external;

    /// @notice Create a new batch configuration to the latest version of all facets.
    /// @param _configurationId unused identifier to the configuration.
    /// @param _facetConfigurations.id list of business logics to be registered.
    /// @param _facetConfigurations.version list of versions of each _facetIds.
    /// @param _isLastBatch boolean to indicate if is the last batch iteration.
    function createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) external;

    /// @notice Cancel a current batch configuration.
    /// @param _configurationId unused identifier to the configuration.
    function cancelBatchConfiguration(bytes32 _configurationId) external;

    /// @notice check if a resolverProxy is registered. If not revert.
    /// @param _configurationId the configuration key to be checked.
    /// @param _version configured version in the resolverProxy.
    function checkResolverProxyConfigurationRegistered(bytes32 _configurationId, uint256 _version) external;

    /// @notice Resolve the facet address knowing configuration, version and selector.
    /// @param _configurationId configured key in the resolverProxy.
    /// @param _version configured version in the resolverProxy. if is 0, ask for latest version.
    /// @param _selector received in the call/tx to be resolver.
    /// @return facetAddress_ with the resolver address of the facet.
    ///       If facet address cant been resolved, returns address(0).
    function resolveResolverProxyCall(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (address facetAddress_);

    /// @notice Resolve if an interfaceId is present in the resolverProxy configured version.
    /// @param _configurationId configured key in the resolverProxy.
    /// @param _version configured version in the resolverProxy. if is 0, ask for latest version.
    /// @param _interfaceId received to be tested.
    /// @return exists_ a true if the interfaceId is part of the resolverProxy configuration.
    function resolveSupportsInterface(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) external view returns (bool exists_);

    /// @notice if a resolverProxy is registered.
    /// @param _configurationId the configuration key to be checked.
    /// @param _version configured version in the resolverProxy.
    function isResolverProxyConfigurationRegistered(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (bool);

    /// @notice Returns the length of configuration keys
    /// @return configurationsLength_
    function getConfigurationsLength() external view returns (uint256 configurationsLength_);

    /// @notice Returns a list of configuration keys
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return configurationIds_ list of business logic keys
    function getConfigurations(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory configurationIds_);

    /// @notice Returns the latest version registered of a resolverProxy configuration.
    /// @param _configurationId key to be obtained.
    /// @return latestVersion_ latest version registered of a resolverProxy configuration.
    function getLatestVersionByConfiguration(bytes32 _configurationId) external view returns (uint256 latestVersion_);

    function getFacetsLengthByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version
    ) external view returns (uint256 facetsLength_);

    function getFacetsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (IDiamondLoupe.Facet[] memory facets_);

    function getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (uint256 facetSelectorsLength_);

    function getFacetSelectorsByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory facetSelectors_);

    /// @notice Returns the list of facet keys.
    /// @param _configurationId key to filter the facets.
    /// @param _version the version to filter the facets.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facetIds_ List of the facet key by key and version
    function getFacetIdsByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory facetIds_);

    /// @notice Returns the facet addresses con configuration
    /// @param _configurationId key to filter the facets.
    /// @param _version the version to filter the facets.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facetAddresses_ List of the facet addresses
    function getFacetAddressesByConfigurationIdAndVersion(
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory facetAddresses_);

    function getFacetIdByConfigurationIdVersionAndSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) external view returns (bytes32 facetId_);

    /// @notice Returns the facet information.
    /// @param _configurationId key to filter the facets.
    /// @param _version the version to filter the facets.
    /// @param _facetId the business logic key
    /// @return facet_ the facet information
    function getFacetByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (IDiamondLoupe.Facet memory facet_);

    /// @notice Returns the facet address.
    /// @param _configurationId key to filter the facets.
    /// @param _version the version to filter the facets.
    /// @param _facetId the business logic key
    /// @return facetAddress_ the facet information
    function getFacetAddressByConfigurationIdVersionAndFacetId(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) external view returns (address facetAddress_);
}
