// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IRoles {

    enum roleName{ADMIN,
        CASHIN,
        BURN,
        WIPE,
        RESCUE,
        PAUSE
    }
    
    function getRoles(address account) external view returns (bytes32[] memory);

    function getRoleId(roleName roleNameToReturn) external view returns(bytes32);
}