// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {LibCommon} from '../../core/LibCommon.sol';
import {IDiamondCutManager} from '../interfaces/diamondCutManager/IDiamondCutManager.sol';
import {IStaticFunctionSelectors} from '../interfaces/resolverProxy/IStaticFunctionSelectors.sol';
import {IDiamondLoupe} from '../interfaces/resolverProxy/IDiamondLoupe.sol';
import {BusinessLogicResolverWrapper} from '../BusinessLogicResolverWrapper.sol';
import {_DIAMOND_CUT_MANAGER_STORAGE_POSITION} from '../../constants/storagePositions.sol';
import {EnumerableSetBytes4} from '../../core/EnumerableSetBytes4.sol';

abstract contract DiamondCutManagerWrapper is IDiamondCutManager, BusinessLogicResolverWrapper {

    struct DiamondCutManagerStorage {
        bytes32[] configurations;
        mapping(bytes32 configId => bool isActive) activeConfigurations;
        mapping(bytes32 configId => uint256 lastVersion) latestVersion;
        mapping(bytes32 configId => uint256 pendingVersion) batchVersion;
        mapping(bytes32 configIdAndVersion => bytes32[] facetIdList) facetIds;
        mapping(bytes32 configIdAndVersion => uint256[] facetVersions) facetVersions;
        mapping(bytes32 configIdAndVersionAndSelector => address facetAddress) facetAddress;
        mapping(bytes32 configIdAndVersionAndFacetId => address facetAddress) addr;
        mapping(bytes32 configIdAndVersionAndFacetId => bytes4[] selectorList) selectors;
        mapping(bytes32 configIdAndVersionAndSelector => bytes32 facetId) selectorToFacetId;
        mapping(bytes32 configIdAndVersionAndFacetId => bytes4[] interfaceList) interfaceIds;
        mapping(bytes32 configIdAndVersionAndInterfaceId => bool isSupported) supportsInterface;
    }

    function _createConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations
    ) internal returns (uint256 latestVersion_) {
        latestVersion_ = _isOngoingConfiguration(_configurationId)
            ? _getBatchConfigurationVersion(_configurationId)
            : _startBatchConfiguration(_configurationId);
        _addFacetsToBatchConfiguration(_configurationId, _facetConfigurations, latestVersion_);
        _activateConfiguration(_configurationId, true);
    }

    function _createBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        bool _isLastBatch
    ) internal returns (uint256 latestVersion_) {
        latestVersion_ = _isOngoingConfiguration(_configurationId)
            ? _getBatchConfigurationVersion(_configurationId)
            : _startBatchConfiguration(_configurationId);
        _addFacetsToBatchConfiguration(_configurationId, _facetConfigurations, latestVersion_);
        _activateConfiguration(_configurationId, _isLastBatch);
    }

    function _activateConfiguration(bytes32 _configurationId, bool _isLastBatch) internal {
        if (!_isLastBatch) return;
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        if (!_dcms.activeConfigurations[_configurationId]) {
            _dcms.configurations.push(_configurationId);
            _dcms.activeConfigurations[_configurationId] = true;
        }
        _dcms.latestVersion[_configurationId] = _dcms.batchVersion[_configurationId];
        delete _dcms.batchVersion[_configurationId];
    }

    function _startBatchConfiguration(bytes32 _configurationId) internal returns (uint256 batchVersion_) {
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();

        unchecked {
            _dcms.batchVersion[_configurationId] = _dcms.latestVersion[_configurationId] + 1;
        }
        batchVersion_ = _getBatchConfigurationVersion(_configurationId);
    }

    function _addFacetsToBatchConfiguration(
        bytes32 _configurationId,
        FacetConfiguration[] calldata _facetConfigurations,
        uint256 _version
    ) internal {
        DiamondCutManagerStorage storage _dcms = _diamondCutManagerStorage();
        bytes32 configVersionHash = _buildHash(_configurationId, _version);

        uint256 facetsLength = _facetConfigurations.length;

        for (uint256 index; index < facetsLength; ) {
            bytes32 facetId = _facetConfigurations[index].id;
            uint256 facetVersion = _facetConfigurations[index].version;
            _dcms.facetIds[configVersionHash].push(facetId);
            _dcms.facetVersions[configVersionHash].push(facetVersion);
            bytes32 configVersionFacetHash = _buildHash(_configurationId, _version, facetId);

            address addr = _resolveBusinessLogicByVersion(facetId, facetVersion);

            if (addr == address(0)) {
                revert FacetIdNotRegistered(_configurationId, facetId);
            }

            if (_dcms.addr[configVersionFacetHash] != address(0)) {
                revert DuplicatedFacetInConfiguration(facetId);
            }

            _dcms.addr[configVersionFacetHash] = addr;

            IStaticFunctionSelectors staticFunctionSelectors = IStaticFunctionSelectors(addr);

            _registerSelectors(
                _dcms,
                _configurationId,
                _version,
                facetId,
                staticFunctionSelectors,
                configVersionFacetHash
            );
            _registerInterfaceIds(_dcms, _configurationId, _version, staticFunctionSelectors, configVersionFacetHash);

            unchecked {
                ++index;
            }
        }
    }

    function _cancelBatchConfiguration(bytes32 _configurationId) internal {
        DiamondCutManagerStorage storage dcms = _diamondCutManagerStorage();
        uint256 batchVersion = _getBatchConfigurationVersion(_configurationId);
        bytes32 configVersionHash = _buildHash(_configurationId, batchVersion);

        bytes32[] storage facetIds = dcms.facetIds[configVersionHash];
        uint256 facetIdsLength = facetIds.length;

        for (uint256 index; index < facetIdsLength; ) {
            bytes32 configVersionFacetHash = _buildHash(_configurationId, batchVersion, facetIds[index]);
            delete dcms.addr[configVersionFacetHash];
            _cleanSelectors(dcms, _configurationId, batchVersion, configVersionFacetHash);
            _cleanInterfacesIds(dcms, _configurationId, batchVersion, configVersionFacetHash);
            unchecked {
                ++index;
            }
        }

        delete dcms.facetVersions[configVersionHash];
        delete dcms.facetIds[configVersionHash];
        delete dcms.batchVersion[_configurationId];
    }

    function _isOngoingConfiguration(bytes32 _configurationId) internal view returns (bool) {
        return _getBatchConfigurationVersion(_configurationId) != 0;
    }

    function _getBatchConfigurationVersion(bytes32 _configurationId) internal view returns (uint256 batchVersion_) {
        batchVersion_ = _diamondCutManagerStorage().batchVersion[_configurationId];
    }

    function _resolveResolverProxyCall(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _dcms.facetAddress[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _selector)
        ];
    }

    function _resolveSupportsInterface(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _interfaceId
    ) internal view returns (bool exists_) {
        exists_ = _dcms.supportsInterface[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _interfaceId)
        ];
    }

    function _isResolverProxyConfigurationRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_isResolverProxyConfigurationNotRegistered(_dcms, _configurationId, _version);
    }

    function _isResolverProxyConfigurationNotRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (bool isRegistered_) {
        return !_dcms.activeConfigurations[_configurationId] || _version > _dcms.latestVersion[_configurationId];
    }

    function _checkResolverProxyConfigurationRegistered(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view {
        if (!_dcms.activeConfigurations[_configurationId] || _version > _dcms.latestVersion[_configurationId]) {
            revert ResolverProxyConfigurationNoRegistered(_configurationId, _version);
        }
    }

    function _getConfigurations(
        DiamondCutManagerStorage storage _dcms,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory configurationIds_) {
        configurationIds_ = _buildPaginated(_dcms.configurations, _pageIndex, _pageLength);
    }

    function _getFacetsLengthByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) internal view returns (uint256 facetsLength_) {
        facetsLength_ = _dcms
            .facetIds[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))]
            .length;
    }

    function _getFacetsByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IDiamondLoupe.Facet[] memory facets_) {
        bytes32[] memory facetIds = _dcms.facetIds[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))
        ];
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = LibCommon.getSize(start, end, facetIds.length);
        facets_ = new IDiamondLoupe.Facet[](size);
        uint256 version = _resolveVersion(_dcms, _configurationId, _version);
        for (uint256 index; index < size; ) {
            facets_[index] = _getFacetByConfigurationIdVersionAndFacetId(
                _dcms,
                _configurationId,
                version,
                facetIds[start]
            );
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    function _getFacetSelectorsLengthByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (uint256 facetSelectorsLength_) {
        facetSelectorsLength_ = _dcms
            .selectors[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)]
            .length;
    }

    function _getFacetSelectorsByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory facetSelectors_) {
        facetSelectors_ = _buildPaginated(
            _dcms.selectors[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)],
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetIdsByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory facetIds_) {
        facetIds_ = _buildPaginated(
            _dcms.facetIds[_buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))],
            _pageIndex,
            _pageLength
        );
    }

    function _getFacetAddressesByConfigurationIdAndVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory facetAddresses_) {
        bytes32[] memory facetIds = _dcms.facetIds[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version))
        ];
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = LibCommon.getSize(start, end, facetIds.length);
        facetAddresses_ = new address[](size);
        for (uint256 index; index < size; ) {
            facetAddresses_[index] = _dcms.addr[
                _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), facetIds[start])
            ];
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    function _getFacetIdByConfigurationIdVersionAndSelector(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) internal view returns (bytes32 facetId_) {
        facetId_ = _dcms.selectorToFacetId[
            _buildHashSelector(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _selector)
        ];
    }

    function _getFacetByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (IDiamondLoupe.Facet memory facet_) {
        bytes32 facetIdHash = _buildHash(
            _configurationId,
            _resolveVersion(_dcms, _configurationId, _version),
            _facetId
        );
        facet_ = IDiamondLoupe.Facet({
            id: _facetId,
            addr: _dcms.addr[facetIdHash],
            selectors: _dcms.selectors[facetIdHash],
            interfaceIds: _dcms.interfaceIds[facetIdHash]
        });
    }

    function _getFacetAddressByConfigurationIdVersionAndFacetId(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) internal view returns (address facetAddress_) {
        facetAddress_ = _dcms.addr[
            _buildHash(_configurationId, _resolveVersion(_dcms, _configurationId, _version), _facetId)
        ];
    }

    function _diamondCutManagerStorage() internal pure returns (DiamondCutManagerStorage storage ds) {
        bytes32 position = _DIAMOND_CUT_MANAGER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }

    function _cleanSelectors(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _batchVersion,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] storage selectors = _dcms.selectors[_configVersionFacetHash];
        uint256 selectorsLength = selectors.length;
        for (uint256 index; index < selectorsLength; ) {
            bytes32 configVersionSelectorHash = _buildHashSelector(_configurationId, _batchVersion, selectors[index]);
            delete _dcms.facetAddress[configVersionSelectorHash];
            delete _dcms.selectorToFacetId[configVersionSelectorHash];
            unchecked {
                ++index;
            }
        }
        delete _dcms.selectors[_configVersionFacetHash];
    }

    function _cleanInterfacesIds(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _batchVersion,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] storage interfaceIds = _dcms.interfaceIds[_configVersionFacetHash];
        uint256 interfaceIdsLength = interfaceIds.length;
        for (uint256 index; index < interfaceIdsLength; ) {
            delete _dcms.supportsInterface[_buildHashSelector(_configurationId, _batchVersion, interfaceIds[index])];
            unchecked {
                ++index;
            }
        }
        delete _dcms.interfaceIds[_configVersionFacetHash];
    }

    function _registerSelectors(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId,
        IStaticFunctionSelectors _static,
        bytes32 _configVersionFacetHash
    ) private {
        address selectorAddress = address(_static);
        bytes4[] memory selectors = _static.getStaticFunctionSelectors();
        _checkSelectorsBlacklist(_configurationId, selectors);
        _dcms.selectors[_configVersionFacetHash] = selectors;
        uint256 length = selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = selectors[index];
            bytes32 configVersionSelectorHash = _buildHashSelector(_configurationId, _version, selector);
            _dcms.facetAddress[configVersionSelectorHash] = selectorAddress;
            _dcms.selectorToFacetId[configVersionSelectorHash] = _facetId;
            unchecked {
                ++index;
            }
        }
    }

    function _registerInterfaceIds(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version,
        IStaticFunctionSelectors _static,
        bytes32 _configVersionFacetHash
    ) private {
        bytes4[] memory interfaceIds = _static.getStaticInterfaceIds();
        _dcms.interfaceIds[_configVersionFacetHash] = interfaceIds;
        uint256 length = interfaceIds.length;
        for (uint256 index; index < length; ) {
            bytes4 interfaceId = interfaceIds[index];
            _dcms.supportsInterface[_buildHashSelector(_configurationId, _version, interfaceId)] = true;
            unchecked {
                ++index;
            }
        }
    }

    function _resolveVersion(
        DiamondCutManagerStorage storage _dcms,
        bytes32 _configurationId,
        uint256 _version
    ) private view returns (uint256 version_) {
        version_ = _version > 0 ? _version : _dcms.latestVersion[_configurationId];
    }

    function _checkSelectorsBlacklist(bytes32 _configurationId, bytes4[] memory _selectors) private view {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];

        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            if (EnumerableSetBytes4.contains(selectorBlacklist, selector)) {
                revert SelectorBlacklisted(selector);
            }
            unchecked {
                ++index;
            }
        }
    }

    function _buildHash(bytes32 _configurationId, uint256 _version) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version));
    }

    function _buildHash(
        bytes32 _configurationId,
        uint256 _version,
        bytes32 _facetId
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _facetId));
    }

    function _buildHashSelector(
        bytes32 _configurationId,
        uint256 _version,
        bytes4 _selector
    ) private pure returns (bytes32 hash_) {
        hash_ = keccak256(abi.encodePacked(_configurationId, _version, _selector));
    }

    function _buildPaginated(
        bytes32[] memory _source,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private pure returns (bytes32[] memory page_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = LibCommon.getSize(start, end, _source.length);
        page_ = new bytes32[](size);
        for (uint256 index; index < size; ) {
            page_[index] = _source[start];
            unchecked {
                ++index;
                ++start;
            }
        }
    }

    function _buildPaginated(
        bytes4[] memory _source,
        uint256 _pageIndex,
        uint256 _pageLength
    ) private pure returns (bytes4[] memory page_) {
        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);
        uint256 size = LibCommon.getSize(start, end, _source.length);
        page_ = new bytes4[](size);
        for (uint256 index; index < size; ) {
            page_[index] = _source[start];
            unchecked {
                ++index;
                ++start;
            }
        }
    }
}
