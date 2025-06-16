// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

bytes32 constant ADMIN_ROLE = 0x00;

/**
 * @dev Role that allows to mint token
 *
 * keccak_256("CASHIN_ROLE")
 */
bytes32 constant _CASHIN_ROLE = 0x53300d27a2268d3ff3ecb0ec8e628321ecfba1a08aed8b817e8acf589a52d25c;

/**
 * @dev Role that allows to burn token
 *
 * keccak_256("BURN_ROLE")
 */
bytes32 constant _BURN_ROLE = 0xe97b137254058bd94f28d2f3eb79e2d34074ffb488d042e3bc958e0a57d2fa22;

/**
 * @dev Role that allows to wipe token
 *
 * keccak_256("WIPE_ROLE")
 */
bytes32 constant _WIPE_ROLE = 0x515f99f4e5a381c770462a8d9879a01f0fd4a414a168a2404dab62a62e1af0c3;

/**
 * @dev Role that allows to rescue both tokens and hbar
 *
 * keccak256("RESCUE_ROLE");
 */
bytes32 constant _RESCUE_ROLE = 0x43f433f336cda92fbbe5bfbdd344a9fd79b2ef138cd6e6fc49d55e2f54e1d99a;

/**
 * @dev Role that allows to pause the token
 *
 * keccak256("PAUSE_ROLE");
 */
bytes32 constant _PAUSE_ROLE = 0x139c2898040ef16910dc9f44dc697df79363da767d8bc92f2e310312b816e46d;

/**
 * @dev Role that allows to pause the token
 *
 * keccak256("FREEZE_ROLE");
 */
bytes32 constant _FREEZE_ROLE = 0x5789b43a60de35bcedee40618ae90979bab7d1315fd4b079234241bdab19936d;

/**
 * @dev Role that allows to pause the token
 *
 * keccak256("DELETE_ROLE");
 */
bytes32 constant _DELETE_ROLE = 0x2b73f0f98ad60ca619bbdee4bcd175da1127db86346339f8b718e3f8b4a006e2;

/**
 * @dev Chain to include in array positions for roles don't available for an account
 *
 * keccak256("WITHOUT_ROLE");
 */
bytes32 constant _WITHOUT_ROLE = 0xe11b25922c3ff9f0f0a34f0b8929ac96a1f215b99dcb08c2891c220cf3a7e8cc;

/**
 * @dev Role that allows to grant or revoke KYC to an account for the token
 *
 * keccak256("KYC_ROLE");
 */
bytes32 constant _KYC_ROLE = 0xdb11624602202c396fa347735a55e345a3aeb3e60f8885e1a71f1bf8d5886db7;

/**
 * @dev Role that allows to update custom fees for the token
 *
 * keccak256("CUSTOM_FEES_ROLE");
 */
bytes32 constant _CUSTOM_FEES_ROLE = 0x6db8586688d24c6a6367d21f709d650b12a2a61dd75e834bd8cd90fd6afa794b;

/**
 * @dev Role that allows to create holds
 *
 * keccak256("HOLD_CREATOR_ROLE");
 */
bytes32 constant _HOLD_CREATOR_ROLE = 0xa0edc074322e33cf8b82b4182ff2827f0fef9412190f0e8417c2669a1e8747e4;
