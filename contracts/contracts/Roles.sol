// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

abstract contract Roles is AccessControlUpgradeable {
        
    /**
    * @dev Role that allows to mint token
    * 
    * keccak_256("CASHIN_ROLE")
    */ 
    bytes32 public constant CASHIN_ROLE = 0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c;

    /**
    * @dev Role that allows to burn token
    * 
    * keccak_256("BURN_ROLE")
    */ 
    bytes32 public constant BURN_ROLE = 0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22;

    /**
    * @dev Role that allows to wipe token
    * 
    * keccak_256("WIPE_ROLE")
    */ 
    bytes32 public constant WIPE_ROLE = 0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;
    
    /**
    * @dev Role that allows to rescue both tokens and hbar
    * 
    * keccak256("RESCUE_ROLE");
    */ 
    bytes32 public constant RESCUE_ROLE = 0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;

    /**
    * @dev Role that allows to pause the token
    * 
    * keccak256("PAUSER_ROLE");
    */ 
    bytes32 public constant PAUSER_ROLE = 0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a;

    /**
    * @dev Array containing all roles
    *
    */
    bytes32[] private ROLES = [CASHIN_ROLE, BURN_ROLE, WIPE_ROLE, RESCUE_ROLE, PAUSER_ROLE];

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param account The account address
     * @return bytes32[] The array containing the roles
     */
    function getRoles(address account)
        external
        view
        returns (bytes32[] memory)
    {
        bytes32[] memory roles = new bytes32[](ROLES.length);

        for (uint i = 0; i < ROLES.length; i++) {
            roles[i] = hasRole(ROLES[i], account) ? ROLES[i] : bytes32(0);
        }
        return roles;
    }
}