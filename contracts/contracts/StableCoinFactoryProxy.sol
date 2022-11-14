// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract StableCoinFactoryProxy is TransparentUpgradeableProxy {
    constructor(address _logic,
        address admin_) payable TransparentUpgradeableProxy(_logic, admin_, "") 
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