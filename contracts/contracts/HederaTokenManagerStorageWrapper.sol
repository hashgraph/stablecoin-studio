// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {_HEDERA_TOKEN_MANAGER_STORAGE_POSITION} from './constants/storagePositions.sol';

abstract contract HederaTokenManagerStorageWrapper {
    /**
     * @dev Storage structure for hedera token manager data
     */
    struct HederaTokenManagerDataStorage {
        string metadata;
    }

    function _hederaTokenManagerDataStorage()
        internal
        pure
        returns (HederaTokenManagerDataStorage storage hederaTokenManagerDataStorage_)
    {
        bytes32 position = _HEDERA_TOKEN_MANAGER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hederaTokenManagerDataStorage_.slot := position
        }
    }
}
