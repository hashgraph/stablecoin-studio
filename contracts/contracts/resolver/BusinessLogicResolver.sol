// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IBusinessLogicResolver} from './interfaces/IBusinessLogicResolver.sol';
import {DiamondCutManager} from './diamondCutManager/DiamondCutManager.sol';
import {Initializable} from '../core/Initializable.sol';
import {ADMIN_ROLE} from '../constants/roles.sol';
import {_BUSINESS_LOGIC_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract BusinessLogicResolver is IBusinessLogicResolver, DiamondCutManager, Initializable {
    error Unimplemented();

    error EmptyBusinessLogicList();

    modifier noEmptyLogics(BusinessLogicRegistryData[] calldata _businessLogics) {
        if (_businessLogics.length == 0) revert EmptyBusinessLogicList();
        _;
    }

    // solhint-disable-next-line func-name-mixedcase
    function initialize_BusinessLogicResolver()
        external
        override
        initializer(_BUSINESS_LOGIC_RESOLVER_KEY)
        returns (bool success_)
    {
        _grantRole(ADMIN_ROLE, msg.sender);
        success_ = true;
    }

    function registerBusinessLogics(
        BusinessLogicRegistryData[] calldata _businessLogics
    ) external override onlyValidKeys(_businessLogics) onlyRole(ADMIN_ROLE) noEmptyLogics(_businessLogics) {
        uint256 latestVersion = _registerBusinessLogics(_businessLogics);

        emit BusinessLogicsRegistered(_businessLogics, latestVersion);
    }

    function addSelectorsToBlacklist(
        bytes32 _configurationId,
        bytes4[] calldata _selectors
    ) external override onlyRole(ADMIN_ROLE) {
        _addSelectorsToBlacklist(_configurationId, _selectors);
    }

    function removeSelectorsFromBlacklist(
        bytes32 _configurationId,
        bytes4[] calldata _selectors
    ) external override onlyRole(ADMIN_ROLE) {
        _removeSelectorsFromBlacklist(_configurationId, _selectors);
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

    function getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes4[] memory selectors_) {
        return _getSelectorsBlacklist(_configurationId, _pageIndex, _pageLength);
    }
}
