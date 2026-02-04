// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {EnumerableSetBytes4} from './EnumerableSetBytes4.sol';

library LibCommon {
    using EnumerableSetBytes4 for EnumerableSetBytes4.Bytes4Set;

    function getFromSet(
        EnumerableSetBytes4.Bytes4Set storage _set,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes4[] memory items_) {
        uint256 listCount = _set.length();
        (uint256 start, uint256 end) = getStartAndEnd(_pageIndex, _pageLength);

        items_ = new bytes4[](getSize(start, end, listCount));

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
