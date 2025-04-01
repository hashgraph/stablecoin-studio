// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract HoldBaseManagement is IHoldManagement {
    /**
     * @dev Storage structure for hold data
     */
    struct HoldDataStorage {
        int64 totalHeldAmount;
        mapping(address => int64) totalHeldAmountByAccount;
        mapping(address => mapping(uint256 => HoldData)) holdsByAccountAndId;
        mapping(address => EnumerableSet.UintSet) holdIdsByAccount;
        mapping(address => uint256) nextHoldIdByAccount;
    }

    HoldDataStorage internal _holdDataStorage;

    /**
     * @dev Modifier to check if there are no active holds
     */
    modifier isHoldActive() {
        if (_holdDataStorage.totalHeldAmount > 0) {
            revert HoldActive();
        }
        _;
    }
}
