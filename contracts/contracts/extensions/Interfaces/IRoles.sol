// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IRoles {

    enum roleName{CASHIN,
        BURN,
        WIPE,
        RESCUE,
        PAUSE,
        ADMIN
    }
    
    function getRoles(address account) external view returns (bytes32[] memory);

    function getRoleId(roleName roleNameToReturn) external view returns(bytes32);
}