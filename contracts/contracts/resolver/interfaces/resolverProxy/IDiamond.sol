// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IDiamondCut} from './IDiamondCut.sol';
import {IResolverLoupe} from './IResolverLoupe.sol';

// solhint-disable-next-line no-empty-blocks
interface IDiamond is IDiamondCut, IResolverLoupe {}
