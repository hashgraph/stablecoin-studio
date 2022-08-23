// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";


contract HederaERC1967Proxy is ERC1967Proxy {

    constructor(address _logic, bytes memory _data) payable public ERC1967Proxy(_logic, _data) {
    }

    function getImplementation()
        external
        view
        returns (address impl)
    {
        return _implementation();
    }
}