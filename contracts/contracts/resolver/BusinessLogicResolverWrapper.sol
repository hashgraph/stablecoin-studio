// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBusinessLogicResolver} from './interfaces/IBusinessLogicResolver.sol';
import {LibCommon} from '../core/LibCommon.sol';
import {IBusinessLogicResolverWrapper} from './interfaces/IBusinessLogicResolverWrapper.sol';
import {IBusinessLogicResolver} from './interfaces/IBusinessLogicResolver.sol';
import {_BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION} from '../constants/storagePositions.sol';
import {EnumerableSetBytes4} from '../core/EnumerableSetBytes4.sol';

abstract contract BusinessLogicResolverWrapper is IBusinessLogicResolverWrapper {
    struct BusinessLogicResolverDataStorage {
        uint256 latestVersion;
        // list of facetIds
        bytes32[] activeBusinessLogics;
        // facetId -> bool
        mapping(bytes32 => bool) businessLogicActive;
        // facetId -> pos (one per vesion) -> version + status + address
        mapping(bytes32 => IBusinessLogicResolver.BusinessLogicVersion[]) businessLogics;
        // keccaak256(facetId, version) -> position
        mapping(bytes32 => uint256) businessLogicVersionIndex;
        // version to status
        mapping(uint256 => IBusinessLogicResolver.VersionStatus) versionStatuses;
        mapping(bytes32 => EnumerableSetBytes4.Bytes4Set) selectorBlacklist;
    }

    modifier validVersion(uint256 _version) {
        _checkValidVersion(_version);
        _;
    }

    modifier onlyValidKeys(IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas) {
        _checkValidKeys(_businessLogicsRegistryDatas);
        _;
    }

    function _registerBusinessLogics(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) internal returns (uint256 latestVersion_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        businessLogicResolverDataStorage.latestVersion++;
        IBusinessLogicResolver.BusinessLogicRegistryData memory _businessLogicsRegistryData;
        for (uint256 index; index < _businessLogicsRegistryDatas.length; index++) {
            _businessLogicsRegistryData = _businessLogicsRegistryDatas[index];

            if (!businessLogicResolverDataStorage.businessLogicActive[_businessLogicsRegistryData.businessLogicKey]) {
                businessLogicResolverDataStorage.businessLogicActive[
                    _businessLogicsRegistryData.businessLogicKey
                ] = true;
                businessLogicResolverDataStorage.activeBusinessLogics.push(
                    _businessLogicsRegistryData.businessLogicKey
                );
            }

            IBusinessLogicResolver.BusinessLogicVersion[] storage versions = businessLogicResolverDataStorage
                .businessLogics[_businessLogicsRegistryData.businessLogicKey];

            versions.push(
                IBusinessLogicResolver.BusinessLogicVersion({
                    versionData: IBusinessLogicResolver.VersionData({
                        version: businessLogicResolverDataStorage.latestVersion,
                        status: IBusinessLogicResolver.VersionStatus.ACTIVATED
                    }),
                    businessLogicAddress: _businessLogicsRegistryData.businessLogicAddress
                })
            );
            businessLogicResolverDataStorage.businessLogicVersionIndex[
                keccak256(
                    abi.encodePacked(
                        _businessLogicsRegistryData.businessLogicKey,
                        businessLogicResolverDataStorage.latestVersion
                    )
                )
            ] = versions.length - 1;
        }

        businessLogicResolverDataStorage.versionStatuses[
            businessLogicResolverDataStorage.latestVersion
        ] = IBusinessLogicResolver.VersionStatus.ACTIVATED;

        return businessLogicResolverDataStorage.latestVersion;
    }

    function _addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            if (!EnumerableSetBytes4.contains(selectorBlacklist, selector)) {
                EnumerableSetBytes4.add(selectorBlacklist, selector);
            }
            unchecked {
                ++index;
            }
        }
    }

    function _removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) internal {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        uint256 length = _selectors.length;
        for (uint256 index; index < length; ) {
            bytes4 selector = _selectors[index];
            if (EnumerableSetBytes4.contains(selectorBlacklist, selector)) {
                EnumerableSetBytes4.remove(selectorBlacklist, selector);
            }
            unchecked {
                ++index;
            }
        }
    }

    function _getVersionStatus(uint256 _version) internal view returns (IBusinessLogicResolver.VersionStatus status_) {
        status_ = _businessLogicResolverStorage().versionStatuses[_version];
    }

    function _getLatestVersion() internal view returns (uint256 latestVersion_) {
        latestVersion_ = _businessLogicResolverStorage().latestVersion;
    }

    function _resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) internal view returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(
            _businessLogicKey,
            _businessLogicResolverStorage().latestVersion
        );
    }

    function _getBusinessLogicCount() internal view returns (uint256 businessLogicCount_) {
        businessLogicCount_ = _businessLogicResolverStorage().activeBusinessLogics.length;
    }

    function _getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory businessLogicKeys_) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        (uint256 start, uint256 end) = LibCommon.getStartAndEnd(_pageIndex, _pageLength);

        uint256 size = LibCommon.getSize(start, end, businessLogicResolverDataStorage.activeBusinessLogics.length);
        businessLogicKeys_ = new bytes32[](size);

        for (uint256 index; index < size; index++) {
            businessLogicKeys_[index] = businessLogicResolverDataStorage.activeBusinessLogics[index + start];
        }
    }

    function _resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) internal view returns (address) {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        if (!businessLogicResolverDataStorage.businessLogicActive[_businessLogicKey]) {
            return address(0);
        }
        uint256 position = businessLogicResolverDataStorage.businessLogicVersionIndex[
            keccak256(abi.encodePacked(_businessLogicKey, _version))
        ];
        IBusinessLogicResolver.BusinessLogicVersion memory businessLogicVersion = businessLogicResolverDataStorage
            .businessLogics[_businessLogicKey][position];
        return businessLogicVersion.businessLogicAddress;
    }

    function _getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory page_) {
        EnumerableSetBytes4.Bytes4Set storage selectorBlacklist = _businessLogicResolverStorage().selectorBlacklist[
            _configurationId
        ];
        page_ = LibCommon.getFromSet(selectorBlacklist, _pageIndex, _pageLength);
    }

    function _businessLogicResolverStorage()
        internal
        pure
        returns (BusinessLogicResolverDataStorage storage businessLogicResolverData_)
    {
        bytes32 position = _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            businessLogicResolverData_.slot := position
        }
    }

    function _checkValidVersion(uint256 _version) private view {
        if (_version == 0 || _version > _businessLogicResolverStorage().latestVersion)
            revert BusinessLogicVersionDoesNotExist(_version);
    }

    function _checkValidKeys(
        IBusinessLogicResolver.BusinessLogicRegistryData[] calldata _businessLogicsRegistryDatas
    ) private view {
        BusinessLogicResolverDataStorage storage businessLogicResolverDataStorage = _businessLogicResolverStorage();

        // Check all previously activated keys are in the array.this
        // Check non duplicated keys.
        uint256 activesBusinessLogicsKeys;
        bytes32 currentKey;
        uint256 length = _businessLogicsRegistryDatas.length;
        uint256 innerIndex;
        for (uint256 index; index < length; ) {
            currentKey = _businessLogicsRegistryDatas[index].businessLogicKey;
            if (uint256(currentKey) == 0) revert ZeroKeyNotValidForBusinessLogic();
            if (_businessLogicsRegistryDatas[index].businessLogicAddress == address(0))
                revert ZeroAddressNotValidForBusinessLogic();

            if (businessLogicResolverDataStorage.businessLogicActive[currentKey]) ++activesBusinessLogicsKeys;
            unchecked {
                innerIndex = index + 1;
            }
            for (; innerIndex < length; ) {
                if (currentKey == _businessLogicsRegistryDatas[innerIndex].businessLogicKey)
                    revert BusinessLogicKeyDuplicated(currentKey);
                unchecked {
                    ++innerIndex;
                }
            }
            unchecked {
                ++index;
            }
        }
        if (activesBusinessLogicsKeys != businessLogicResolverDataStorage.activeBusinessLogics.length)
            revert AllBusinessLogicKeysMustBeenInformed();
    }
}
