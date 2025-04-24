// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {_STABLE_COIN_FACTORY_STORAGE_POSITION} from './constants/storagePositions.sol';

abstract contract StableCoinFactoryStorageWrapper {
    /**
     * @dev Storage structure for stablecoin factory data
     */
    struct StableCoinFactoryDataStorage {
        address admin;
        address[] hederaTokenManagerAddress;
    }

    function _stableCoinFactoryDataStorage()
        internal
        pure
        returns (StableCoinFactoryDataStorage storage stableCoinFactoryDataStorage_)
    {
        bytes32 position = _STABLE_COIN_FACTORY_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            stableCoinFactoryDataStorage_.slot := position
        }
    }
}
