// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IDiamondCutManager} from './diamondCutManager/IDiamondCutManager.sol';

/// @title Contracts Repository
/// @notice This contract is used to register and resolve Business Logics (aka contracts) addresses using
///          a bytes32 as key.
///
///			All registered Business Logics must have the same number of versions, so that they have a common "latest"
///			version and any previous version can be resolved for any existing Business Logic no matter when it was
///			added to the register.
///         The idea is that consumers should use Business Logics belonging to the same version since those are
/// 		considered fully compatible.
///			Registering a business logic (register = update its latest version or add it to the registry) will increase the
///			latest version for all Business Logics by 1.
interface IBusinessLogicResolver is IDiamondCutManager {
    enum VersionStatus {
        NONE,
        ACTIVATED,
        DEACTIVATED
    }

    /// @notice structure defining the input data type when registering or updating business logics
    struct BusinessLogicRegistryData {
        bytes32 businessLogicKey;
        address businessLogicAddress;
    }

    /// @notice structure defining the a given Version status
    struct VersionData {
        uint256 version;
        VersionStatus status;
    }

    struct BusinessLogicVersion {
        VersionData versionData;
        address businessLogicAddress;
    }

    /// @notice Event emitted when Business Logic(s) are registered (updated or added).
    /// @param businessLogics list of registered Business Logics.
    /// @param newLatestVersion new latest version = previous latest version + 1.
    event BusinessLogicsRegistered(BusinessLogicRegistryData[] businessLogics, uint256[] newLatestVersion);

    // solhint-disable-next-line func-name-mixedcase
    function initialize_BusinessLogicResolver() external returns (bool success_);

    /// @notice Update existing business logics addresses or add new business logics to the register.
    ///         the BusinessLogicsRegistered event must be emitted.
    ///         The latest "version" for all business logics is increased by 1.
    /// @param _businessLogics list of business logics to be registered.
    function registerBusinessLogics(BusinessLogicRegistryData[] calldata _businessLogics) external;

    /// @notice Adds a list of selectors to the blacklist
    /// @param _configurationId the configuration key to be checked.
    /// @param _selectors list of selectors to be added to the blacklist
    function addSelectorsToBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;

    /// @notice Removes a list of selectors from the blacklist
    /// @param _configurationId the configuration key to be checked.
    /// @param _selectors list of selectors to be removed from the blacklist
    function removeSelectorsFromBlacklist(bytes32 _configurationId, bytes4[] calldata _selectors) external;

    /// @notice Returns the current status of a given version
    function getVersionStatus(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (VersionStatus status_);

    /// @notice Returns the current latest version for all business logics
    function getLatestVersion(bytes32 _businessLogicKey) external view returns (uint256 latestVersion_);

    /// @notice Returns the business logic address for the latest version
    /// @param _businessLogicKey key of the business logic. Business Logic must be active.
    function resolveLatestBusinessLogic(
        bytes32 _businessLogicKey
    ) external view returns (address businessLogicAddress_);

    /// @notice Returns a specific business logic version address
    /// @param _businessLogicKey key of the business logic. Business Logic must be active.
    /// @param _version the version
    function resolveBusinessLogicByVersion(
        bytes32 _businessLogicKey,
        uint256 _version
    ) external view returns (address businessLogicAddress_);

    /// @notice Returns the count of currently active business logics
    function getBusinessLogicCount() external view returns (uint256 businessLogicCount_);

    /// @notice Returns a list of business logic keys
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return businessLogicKeys_ list of business logic keys
    function getBusinessLogicKeys(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory businessLogicKeys_);

    /// @notice Returns the list of selectors in the blacklist
    /// @param _configurationId the configuration key to be checked.
    /// @param _pageIndex members to skip : _pageIndex * _pageLength
    /// @param _pageLength number of members to return
    /// @return selectors_ List of the selectors in the blacklist
    function getSelectorsBlacklist(
        bytes32 _configurationId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes4[] memory selectors_);
}
