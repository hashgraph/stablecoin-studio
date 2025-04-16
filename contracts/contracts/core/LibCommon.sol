// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

library LibCommon {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;

    // functions for set
    function getFromSet(
        EnumerableSet.Bytes32Set storage _set,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory items_) {
        uint256 listCount = _set.length();
        (uint256 start, uint256 end) = getStartAndEnd(_pageIndex, _pageLength);

        items_ = new bytes32[](getSize(start, end, listCount));

        for (uint256 i = 0; i < items_.length; i++) {
            items_[i] = _set.at(start + i);
        }
    }

    function getFromSet(
        EnumerableSet.UintSet storage _set,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory items_) {
        uint256 listCount = _set.length();
        (uint256 start, uint256 end) = getStartAndEnd(_pageIndex, _pageLength);

        items_ = new uint256[](getSize(start, end, listCount));

        for (uint256 i = 0; i < items_.length; i++) {
            items_[i] = _set.at(start + i);
        }
    }

    function getFromSet(
        EnumerableSet.AddressSet storage _set,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory items_) {
        uint256 listCount = _set.length();
        (uint256 start, uint256 end) = getStartAndEnd(_pageIndex, _pageLength);

        items_ = new address[](getSize(start, end, listCount));

        for (uint256 i = 0; i < items_.length; i++) {
            items_[i] = _set.at(start + i);
        }
    }

    function getSize(uint256 _start, uint256 _end, uint256 _listCount) internal pure returns (uint256) {
        if (_start >= _end) {
            return 0;
        }
        if (_start >= _listCount) {
            return 0;
        }

        if (_end > _listCount) {
            _end = _listCount;
        }

        return _end - _start;
    }

    function getStartAndEnd(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal pure returns (uint256 start_, uint256 end_) {
        start_ = _pageIndex * _pageLength;
        end_ = start_ + _pageLength;
    }
}
