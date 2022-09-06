// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

abstract contract Roles {
    
    // keccak_256("SUPPLIER_ROLE")
    bytes32 public constant SUPPLIER_ROLE = 0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60;

    // keccak_256("WIPE_ROLE")
    bytes32 public constant WIPE_ROLE = 0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;
    
    // keccak_256("ADMIN_SUPPLIER_ROLE")
    bytes32 public constant ADMIN_SUPPLIER_ROLE = 0x8dd0f644b9b923c24aa7291efd0bd4141a413ec8cdb492e43928e281ce1a38e9;

        /**
    * @dev Role to protect rescue token and rescue hbar
    * 
    * keccak256("RESCUE_ROLE");
    */ 
    bytes32 public constant RESCUE_ROLE = 0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;
}