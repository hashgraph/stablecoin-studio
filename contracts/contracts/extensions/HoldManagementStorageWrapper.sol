// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.24;

import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {_HOLD_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract HoldManagementStorageWrapper {
    /**
     * @dev Storage structure for hold data
     */
    struct HoldDataStorage {
        int64 totalHeldAmount;
        mapping(address tokenHolder => int64 totalHeldAmount) totalHeldAmountByAccount;
        // solhint-disable-next-line max-line-length
        mapping(address tokenHolder => mapping(uint256 holdId => IHoldManagement.HoldData holdData)) holdsByAccountAndId;
        mapping(address tokenHolder => EnumerableSet.UintSet holdIdSet) holdIdsByAccount;
        mapping(address tokenHolder => uint256 nextHoldId) nextHoldIdByAccount;
    }

    function _holdDataStorage() internal pure returns (HoldDataStorage storage holdDataStorage_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            holdDataStorage_.slot := position
        }
    }
}
