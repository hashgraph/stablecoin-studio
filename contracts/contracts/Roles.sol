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
    * keccak256("PAUSE_ROLE");
    */ 
    bytes32 public constant PAUSE_ROLE = 0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d;

    /**
    * @dev Role that allows to pause the token
    * 
    * keccak256("FREEZE_ROLE");
    */ 
    bytes32 public constant FREEZE_ROLE = 0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d;

    /**
    * @dev Chain to include in array positions for roles don't available for an account
    * 
    * keccak256("WITHOU_ROLE");
    */ 
    bytes32 private constant WITHOUT_ROLE = 0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc;

    /**
    * @dev Array containing all roles
    *
    */
    bytes32[6] public ROLES = [CASHIN_ROLE, BURN_ROLE, WIPE_ROLE, RESCUE_ROLE, PAUSE_ROLE, DEFAULT_ADMIN_ROLE];

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
        bytes32[] memory roles = new bytes32[](7);
        roles[0] = hasRole(CASHIN_ROLE, account) ? CASHIN_ROLE : WITHOUT_ROLE;
        roles[1] = hasRole(BURN_ROLE, account) ? BURN_ROLE : WITHOUT_ROLE;
        roles[2] = hasRole(WIPE_ROLE, account) ? WIPE_ROLE : WITHOUT_ROLE;
        roles[3] = hasRole(RESCUE_ROLE, account) ? RESCUE_ROLE : WITHOUT_ROLE;
        roles[4] = hasRole(PAUSE_ROLE, account) ? PAUSE_ROLE : WITHOUT_ROLE;
        roles[5] = hasRole(FREEZE_ROLE, account) ? FREEZE_ROLE : WITHOUT_ROLE;
        roles[6] = hasRole(DEFAULT_ADMIN_ROLE, account) ? DEFAULT_ADMIN_ROLE : WITHOUT_ROLE;
        return roles;
    }
}