// SPDX-License-Identifier: MIT
pragma solidity 0.8.16;

interface IRoles {

    enum RoleName{ADMIN,
        CASHIN,
        BURN,
        WIPE,
        RESCUE,
        PAUSE,
        FREEZE,
        DELETE
    }
    
    function getRoles(address account) external view returns (bytes32[] memory);

    function getRoleId(RoleName roleNameToReturn) external view returns(bytes32);
}