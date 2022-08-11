// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./SupplyController.sol";

contract SupplyControllerV1_1 is SupplyController {

    function initializeV1_1() 
        external 
    {
        version = "1.1";
    }

    function getVersion() 
        public 
        view 
        returns (bytes32) 
    {
        return version;
    }
}
