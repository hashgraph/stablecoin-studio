// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./SupplyController.sol";

contract SupplyControllerV2 is SupplyController {

    function getVersion() 
        public 
        view 
        returns (bytes32) 
    {
        return version;
    }
}
