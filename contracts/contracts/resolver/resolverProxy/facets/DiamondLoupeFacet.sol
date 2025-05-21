// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ResolverProxyUnstructured} from '../unstructured/ResolverProxyUnstructured.sol';
import {IDiamondLoupe} from '../../interfaces/resolverProxy/IDiamondLoupe.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {_DIAMOND_LOUPE_RESOLVER_KEY} from '../../../constants/resolverKeys.sol';

// HACK: I think that Loupe and Cut implementation should be only one contract.
contract DiamondLoupeFacet is IDiamondLoupe, IERC165, ResolverProxyUnstructured {
    function getFacets() external view override returns (Facet[] memory facets_) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        facets_ = _getFacets(ds, 0, _getFacetsLength(ds));
    }

    function getFacetsLength() external view override returns (uint256 facetsLength_) {
        facetsLength_ = _getFacetsLength(_resolverProxyStorage());
    }

    function getFacetsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (Facet[] memory facets_) {
        facets_ = _getFacets(_resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetSelectors(bytes32 _facetId) external view override returns (bytes4[] memory facetSelectors_) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        facetSelectors_ = _getFacetSelectors(ds, _facetId, 0, _getFacetSelectorsLength(ds, _facetId));
    }

    function getFacetSelectorsLength(bytes32 _facetId) external view override returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _getFacetSelectorsLength(_resolverProxyStorage(), _facetId);
    }

    function getFacetSelectorsByPage(
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _getFacetSelectors(_resolverProxyStorage(), _facetId, _pageIndex, _pageLength);
    }

    function getFacetIds() external view override returns (bytes32[] memory facetIds_) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        facetIds_ = _getFacetIds(ds, 0, _getFacetsLength(ds));
    }

    function getFacetIdsByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory facetIds_) {
        facetIds_ = _getFacetIds(_resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetAddresses() external view override returns (address[] memory facetAddresses_) {
        ResolverProxyStorage storage ds = _resolverProxyStorage();
        facetAddresses_ = _getFacetAddresses(ds, 0, _getFacetsLength(ds));
    }

    function getFacetAddressesByPage(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = _getFacetAddresses(_resolverProxyStorage(), _pageIndex, _pageLength);
    }

    function getFacetIdBySelector(bytes4 _selector) external view returns (bytes32 facetId_) {
        facetId_ = _getFacetIdBySelector(_resolverProxyStorage(), _selector);
    }

    function getFacet(bytes32 _facetId) external view override returns (Facet memory facet_) {
        facet_ = _getFacet(_resolverProxyStorage(), _facetId);
    }

    function getFacetAddress(bytes4 _selector) external view override returns (address facetAddress_) {
        facetAddress_ = _getFacetAddress(_resolverProxyStorage(), _selector);
    }

    // This implements ERC-165.
    function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
        return _supportsInterface(_resolverProxyStorage(), _interfaceId);
    }

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DIAMOND_LOUPE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](14);
        uint256 selectorIndex;
        unchecked {
            staticFunctionSelectors_[selectorIndex++] = this.getFacets.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetsLength.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetsByPage.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetSelectors.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetSelectorsLength.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetSelectorsByPage.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetIds.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetIdsByPage.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetAddresses.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetAddressesByPage.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetIdBySelector.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacet.selector;
            staticFunctionSelectors_[selectorIndex++] = this.getFacetAddress.selector;
            staticFunctionSelectors_[selectorIndex++] = this.supportsInterface.selector;
        }
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondLoupe).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC165).interfaceId;
    }
}
