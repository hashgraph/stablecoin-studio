// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {_HEDERA_RESERVE_STORAGE_POSITION} from './constants/storagePositions.sol';

abstract contract HederaReserveStorageWrapper {
    /**
     * @dev Storage structure for hedera reserve data
     */
    struct HederaReserveDataStorage {
        int256 reserveAmount;
        address admin;
    }

    function _hederaReserveDataStorage()
        internal
        pure
        returns (HederaReserveDataStorage storage hederaReserveDataStorage_)
    {
        bytes32 position = _HEDERA_RESERVE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hederaReserveDataStorage_.slot := position
        }
    }
}
