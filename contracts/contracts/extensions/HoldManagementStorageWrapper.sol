// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {_HOLD_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract HoldManagementStorageWrapper {
    /**
     * @dev Storage structure for hold data
     */
    struct HoldDataStorage {
        int64 totalHeldAmount;
        mapping(address => int64) totalHeldAmountByAccount;
        mapping(address => mapping(uint256 => IHoldManagement.HoldData)) holdsByAccountAndId;
        mapping(address => EnumerableSet.UintSet) holdIdsByAccount;
        mapping(address => uint256) nextHoldIdByAccount;
    }

    /**
     * @dev Modifier to check if there are no active holds
     */
    modifier isHoldActive() {
        if (_holdDataStorage().totalHeldAmount > 0) {
            revert IHoldManagement.HoldActive();
        }
        _;
    }

    function _holdDataStorage() internal pure returns (HoldDataStorage storage holdDataStorage_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            holdDataStorage_.slot := position
        }
    }
}
