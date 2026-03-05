// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IStaticFunctionSelectors} from './IStaticFunctionSelectors.sol';

// A loupe is a small magnifying glass used to look at resolverProxys.
// These functions look at resolverProxys
/// #### Structs
/// ```
///    struct Facet {
///        bytes32 facetId;
///        address facetAddress;
///        bytes4[] selectors;
///    }
///```
interface IDiamondLoupe is IStaticFunctionSelectors {
    struct Facet {
        bytes32 id;
        address addr;
        bytes4[] selectors;
        bytes4[] interfaceIds;
    }

    /// @notice Gets all facet addresses and their four byte function selectors.
    /// @return facets_ Facet
    function getFacets() external view returns (Facet[] memory facets_);

    /// @notice Gets facet length.
    /// @return facetsLength_ Facets length
    function getFacetsLength() external view returns (uint256 facetsLength_);

    /// @notice Gets all facet addresses and their four byte function selectors.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facets_ Facet
    function getFacetsByPage(uint256 _pageIndex, uint256 _pageLength) external view returns (Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet.
    /// @param _facetId The facet key for the resolver.
    /// @return facetSelectors_
    function getFacetSelectors(bytes32 _facetId) external view returns (bytes4[] memory facetSelectors_);

    /// @notice Gets the function selectors length.
    /// @param _facetId The facet key for the resolver.
    /// @return facetSelectorsLength_
    function getFacetSelectorsLength(bytes32 _facetId) external view returns (uint256 facetSelectorsLength_);

    /// @notice Gets all the function selectors supported by a specific facet.
    /// @param _facetId The facet key for the resolver.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facetSelectors_
    function getFacetSelectorsByPage(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory facetSelectors_);

    /// @notice Get all the facet addresses used by a resolverProxy.
    /// @return facetIds_
    function getFacetIds() external view returns (bytes32[] memory facetIds_);

    /// @notice Get all the facet addresses used by a resolverProxy.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facetIds_
    function getFacetIdsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory facetIds_);

    /// @notice Get all the facet addresses used by a resolverProxy.
    /// @return facetAddresses_
    function getFacetAddresses() external view returns (address[] memory facetAddresses_);

    /// @notice Get all the facet addresses used by a resolverProxy.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return facetAddresses_
    function getFacetAddressesByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory facetAddresses_);

    /// @notice Gets the facet key that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _selector The function selector.
    /// @return facetId_ The facet key.
    function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_);

    /// @notice Get the information associated with an specific facet.
    /// @dev If facet is not found return empty Facet struct.
    /// @param _facetId The facet key for the resolver.
    /// @return facet_ Facet data.
    function getFacet(bytes32 _facetId) external view returns (Facet memory facet_);

    /// @notice Gets the facet that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _selector The function selector.
    /// @return facetAddress_ The facet address.
    function getFacetAddress(bytes4 _selector) external view returns (address facetAddress_);
}
