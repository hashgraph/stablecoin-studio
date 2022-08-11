// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "./HederaERC20.sol";

contract HederaERC20V2 is HederaERC20 {

    function getVersion() 
        public 
        view 
        returns (bytes32) 
    {
        return version;
    }
}
