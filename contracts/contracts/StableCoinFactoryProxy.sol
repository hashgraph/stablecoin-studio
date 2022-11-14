// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract StableCoinFactoryProxy is TransparentUpgradeableProxy {
    constructor() payable TransparentUpgradeableProxy(address(0x167), address(0x167), "") 
    {    
    }

    /**
     * @dev Returns the implementation behind the proxy
     *
     * @return address The address of the implementation behind the proxy
     */
    function getImplementation() 
        external 
        view 
        returns (address) 
    {
        return _implementation();
    }
}