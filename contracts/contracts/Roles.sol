// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

abstract contract Roles {
    
    // keccak_256("SUPPLIER_ROLE")
    bytes32 public constant SUPPLIER_ROLE = 0xd1ae8bbdabd60d63e418b84f5ad6f9cba90092c9816d7724d85f0d4e4bea2c60;

    // keccak_256("WIPE_ROLE")
    bytes32 public constant WIPE_ROLE = 0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;

}