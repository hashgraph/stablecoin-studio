// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable max-line-length

/**
 * @notice Storage position constants used across the Stablecoin Studio system.
 *
 * These constants define the exact storage slot to be used by each module or facet when accessing
 * or writing state variables in the proxy's storage context via delegatecall.
 *
 * There are two types of constants:
 *
 * 1. Hashed storage keys (via keccak256): these are used for most modules and follow the standard
 *    unstructured storage pattern to avoid slot collisions. Each module has a unique hash.
 *
 * 2. Fixed slot numbers (converted to bytes32): these are used in modules that must maintain compatibility
 *    with legacy storage layout from a previous monolithic contract (e.g. `HederaTokenManager`). They point to
 *    specific slot numbers (e.g. 51, 101, 701) where critical data is already stored and must not move.
 *
 *  Do NOT modify or reorder these values.
 */

// keccak256('stablecoin.studio.business.logic.resolver.storage');
bytes32 constant _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION = 0x955a2786fa49b1e11605278e5b534741ae6d6570ebfa34ef604980228573c85d;

// keccak256('stablecoin.studio.diamond.cut.manager.storage');
bytes32 constant _DIAMOND_CUT_MANAGER_STORAGE_POSITION = 0x72d5df1de692f6c56351e47399f8b12f5a54cd3673dce5092e095fa19212f5a5;

// keccak256('stablecoin.studio.initializable.storage');
bytes32 constant _INITIALIZABLE_STORAGE_POSITION = 0xa58f1fcb40822c09091f9fa7b9f2bcc0672875fea7cf65ea9be9334e91fd948e;

// keccak256('stablecoin.studio.hold.storage');
bytes32 constant _HOLD_STORAGE_POSITION = 0x55eb875db6f21625db342149ef0f0b78f6afec1625e2c812812e031b05ee4bd1;

// keccak256('stablecoin.studio.hedera.reserve.storage');
bytes32 constant _HEDERA_RESERVE_STORAGE_POSITION = 0xbed633dbd0bacd43d3399872bf1a59f5d8a56ae8e7638cd27a49cc24ecec5630;

// keccak256('stablecoin.studio.stable.coin.factory.storage');
bytes32 constant _STABLE_COIN_FACTORY_STORAGE_POSITION = 0xb0e6750e851c57435b04114f257b158c4b5f3ed0ea8aa4cc132d1cbcbe0b79e6;

// keccak256('stablecoin.studio.resolverProxy.storage');
bytes32 constant _RESOLVER_PROXY_STORAGE_POSITION = 0x72d4cc0a3f672d627d7746733345a3b1cc00ee12f57141f1dd5e005c8ceaec5e;

// @dev Legacy storage slots used for migration purposes.
// These constants preserve the storage layout from previous deployments behind a proxy.

// Slot 1
bytes32 constant _TOKEN_OWNER_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000001;

// slot 51
bytes32 constant _ROLES_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000033;

// slot 101
bytes32 constant _SUPPLIER_ADMIN_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000065;

// slot 151
bytes32 constant _RESERVE_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000097;

// slot 201
bytes32 constant _CASH_IN_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000000c9;

// slot 251
bytes32 constant _BURNABLE_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000000fb;

// slot 301
bytes32 constant _WIPEABLE_STORAGE_POSITION = 0x000000000000000000000000000000000000000000000000000000000000012d;

// slot 351
bytes32 constant _PAUSABLE_STORAGE_POSITION = 0x000000000000000000000000000000000000000000000000000000000000015f;

// slot 401
bytes32 constant _FREEZABLE_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000191;

// slot 451
bytes32 constant _DELETABLE_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000001c3;

// slot 501
bytes32 constant _RESCUABLE_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000001f5;

// slot 551
bytes32 constant _KYC_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000227;

// slot 601
bytes32 constant _ROLE_MANAGEMENT_STORAGE_POSITION = 0x0000000000000000000000000000000000000000000000000000000000000259;

// slot 651
bytes32 constant _CUSTOM_FEES_STORAGE_POSITION = 0x000000000000000000000000000000000000000000000000000000000000028b;

// slot 701
bytes32 constant _HEDERA_TOKEN_MANAGER_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000002bd;

// slot 751
bytes32 constant _HOLD_STORAGE_POSITION = 0x00000000000000000000000000000000000000000000000000000000000002ef;

// solhint-enable max-line-length
