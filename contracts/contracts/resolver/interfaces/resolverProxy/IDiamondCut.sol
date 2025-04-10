// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IStaticFunctionSelectors} from './IStaticFunctionSelectors.sol';
import {IBusinessLogicResolver} from '../IBusinessLogicResolver.sol';

interface IDiamondCut is IStaticFunctionSelectors {
    function updateConfigVersion(uint256 _newVersion) external;

    function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external;

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external;

    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_);
}
