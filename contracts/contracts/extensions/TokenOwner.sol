// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {ITokenOwner} from './Interfaces/ITokenOwner.sol';
import {TokenOwnerStorageWrapper} from './TokenOwnerStorageWrapper.sol';

contract TokenOwner is ITokenOwner, TokenOwnerStorageWrapper {
    /**
     * @dev Returns the token address
     *
     */
    function getTokenAddress() external view override returns (address) {
        return _getTokenAddress();
    }
}
