// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract HederaERC20Proxy is TransparentUpgradeableProxy {
    constructor(address _logic,
        address admin_,
        bytes memory _data) payable TransparentUpgradeableProxy(_logic, admin_, _data) 
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

    /**
     * @dev Returns the admin controlling the proxy
     *
     * @return address The address of the admin account in control of the proxy
     */
    function getAdmin() 
        external 
        view 
        returns (address) 
    {
        return _getAdmin();
    }
}