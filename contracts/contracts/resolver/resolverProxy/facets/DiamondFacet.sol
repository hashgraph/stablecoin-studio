// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {DiamondCutFacet} from './DiamondCutFacet.sol';
import {DiamondLoupeFacet} from './DiamondLoupeFacet.sol';
import {_DIAMOND_RESOLVER_KEY} from '../../../constants/resolverKeys.sol';
import {IDiamond} from '../../interfaces/resolverProxy/IDiamond.sol';
import {IDiamondCut} from '../../interfaces/resolverProxy/IDiamondCut.sol';
import {IDiamondLoupe} from '../../interfaces/resolverProxy/IDiamondLoupe.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {IStaticFunctionSelectors} from '../../interfaces/resolverProxy/IStaticFunctionSelectors.sol';

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond.
// The loupe functions are required by the EIP2535 Diamonds standard
contract DiamondFacet is IDiamond, DiamondCutFacet, DiamondLoupeFacet {
    function getStaticResolverKey()
        external
        pure
        override(IStaticFunctionSelectors, DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _DIAMOND_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override(IStaticFunctionSelectors, DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](18);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfigVersion.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateConfig.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.updateResolver.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getConfigInfo.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacets.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectors.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsLength.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetSelectorsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIds.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdsByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddresses.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddressesByPage.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetIdBySelector.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacet.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFacetAddress.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.supportsInterface.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override(IStaticFunctionSelectors, DiamondCutFacet, DiamondLoupeFacet)
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondCut).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IDiamondLoupe).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC165).interfaceId;
    }
}
