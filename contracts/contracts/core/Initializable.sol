// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import {AddressUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol';
import {_INITIALIZABLE_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract Initializable {
    struct InitializableStorage {
        /**
         * @dev Indicates that the contract is in the process of being initialized.
         */
        mapping(bytes32 => bool) initialized;
    }

    /**
     * @dev Triggered when the facet has been initialized or reinitialized.
     */
    event Initialized(bytes32 facet);

    error ContractIsAlreadyInitialized(bytes32 facet);

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier initializer(bytes32 _facetKey) {
        _preInitializer(_facetKey);
        _;
        _postInitializer(_facetKey);
    }
    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     *
     * Emits an {Initialized} event the first time it is successfully executed.
     */
    function _disableInitializers(bytes32 _facetKey) internal virtual {
        _checkInitialized(_facetKey);
        _postInitializer(_facetKey);
    }

    /**
     * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
     */
    function _isInitialized(bytes32 _facetKey) private view returns (bool) {
        return _initializableStorage().initialized[_facetKey];
    }

    function _preInitializer(bytes32 _facetKey) private view {
        if (!AddressUpgradeable.isContract(msg.sender) || _isInitialized(_facetKey))
            revert ContractIsAlreadyInitialized(_facetKey);
    }
    function _postInitializer(bytes32 _facetKey) private {
        _initializableStorage().initialized[_facetKey] = true;
        emit Initialized(_facetKey);
    }

    function _checkInitialized(bytes32 _facetKey) private view {
        if (_isInitialized(_facetKey)) revert ContractIsAlreadyInitialized(_facetKey);
    }

    function _initializableStorage() private pure returns (InitializableStorage storage initializableStorage_) {
        bytes32 position = _INITIALIZABLE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            initializableStorage_.slot := position
        }
    }
}
