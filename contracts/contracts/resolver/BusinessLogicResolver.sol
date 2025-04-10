// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBusinessLogicResolver} from './interfaces//IBusinessLogicResolver.sol';
import {DiamondCutManager} from './diamondCutManager/DiamondCutManager.sol';
import {ADMIN_ROLE} from '../constants/roles.sol';

contract BusinessLogicResolver is IBusinessLogicResolver, DiamondCutManager {
    error Unimplemented();
    // solhint-disable-next-line func-name-mixedcase
    function initialize_BusinessLogicResolver()
        external
        override
        onlyUninitialized(_businessLogicResolverStorage().initialized)
        returns (bool success_)
    {
        _grantRole(ADMIN_ROLE, _msgSender());

        _businessLogicResolverStorage().initialized = true;
        success_ = true;
    }

    function registerBusinessLogics(
        BusinessLogicRegistryData[] calldata _businessLogics
    ) external override onlyValidKeys(_businessLogics) onlyRole(ADMIN_ROLE) {
        uint256 latestVersion = _registerBusinessLogics(_businessLogics);

        emit BusinessLogicsRegistered(_businessLogics, latestVersion);
    }

    function getVersionStatus(
        uint256 _version
    ) external view override validVersion(_version) returns (VersionStatus status_) {
        status_ = _getVersionStatus(_version);
    }

    function getLatestVersion() external view override returns (uint256 latestVersion_) {
        latestVersion_ = _getLatestVersion();
    }

    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view override returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveLatestBusinessLogic(_businessLogicKey);
    }

    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view override validVersion(_version) returns (address businessLogicAddress_) {
        businessLogicAddress_ = _resolveBusinessLogicByVersion(_businessLogicKey, _version);
    }

    function getBusinessLogicCount() external view override returns (uint256 businessLogicCount_) {
        businessLogicCount_ = _getBusinessLogicCount();
    }

    function getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory businessLogicKeys_) {
        businessLogicKeys_ = _getBusinessLogicKeys(_pageIndex, _pageLength);
    }
}
