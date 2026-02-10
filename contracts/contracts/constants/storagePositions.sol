// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

// solhint-disable max-line-length

/**
  @dev Storage position constants used across the Stablecoin Studio system

  Each module or facet uses a fixed storage slot to safely read/write state via delegatecall

  There are two types of storage positions:

  1. Hashed keys (keccak256): used for modules outside the SCS core, following the unstructured storage pattern
  2. Fixed slot numbers: used by SCS modules to maintain compatibility with legacy layout

  These fixed slots must not be reordered

**/

// keccak256('stablecoin.studio.business.logic.resolver.storage');
bytes32 constant _BUSINESS_LOGIC_RESOLVER_STORAGE_POSITION = 0x955a2786fa49b1e11605278e5b534741ae6d6570ebfa34ef604980228573c85d;

// keccak256('stablecoin.studio.diamond.cut.manager.storage');
bytes32 constant _DIAMOND_CUT_MANAGER_STORAGE_POSITION = 0x72d5df1de692f6c56351e47399f8b12f5a54cd3673dce5092e095fa19212f5a5;

// keccak256('stablecoin.studio.initializable.storage');
bytes32 constant _INITIALIZABLE_STORAGE_POSITION = 0xa58f1fcb40822c09091f9fa7b9f2bcc0672875fea7cf65ea9be9334e91fd948e;

// keccak256('stablecoin.studio.hedera.reserve.storage');
bytes32 constant _HEDERA_RESERVE_STORAGE_POSITION = 0xbed633dbd0bacd43d3399872bf1a59f5d8a56ae8e7638cd27a49cc24ecec5630;

// keccak256('stablecoin.studio.stable.coin.factory.storage');
bytes32 constant _STABLE_COIN_FACTORY_STORAGE_POSITION = 0xb0e6750e851c57435b04114f257b158c4b5f3ed0ea8aa4cc132d1cbcbe0b79e6;

// keccak256('stablecoin.studio.resolverProxy.storage');
bytes32 constant _RESOLVER_PROXY_STORAGE_POSITION = 0x72d4cc0a3f672d627d7746733345a3b1cc00ee12f57141f1dd5e005c8ceaec5e;

/**
    @dev Fixed slot numbers

    Due to inheritance from a `TransparentUpgradeableProxy`, all facets in the Stablecoin Contract System (SCS) must share the same storage context. This means each facet must use **fixed storage slots** that do not overlap.

    To maintain upgrade safety and extensibility:
    - Each facet is assigned a dedicated slot offset, spaced 50 slots apart (e.g., slot 1, 51, 101, ...).
    - This ensures future facets can be added without overwriting existing storage.
    - Even if a facet currently does not require storage, its reserved slot is left in place and must not be reused.

    This storage alignment is critical to preserve proxy compatibility and prevent storage collisions.

    > Do NOT modify or reorder storage slots. Each position is intentionally reserved for a specific module or future expansion.

    To add a new facet with storage, simply add 50 to the last used slot and define the next available slot accordingly.
**/

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

// slot 801

// solhint-enable max-line-length
