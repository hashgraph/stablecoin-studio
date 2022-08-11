// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./HederaERC20.sol";

contract HederaERC20V1_1 is HederaERC20 {

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
