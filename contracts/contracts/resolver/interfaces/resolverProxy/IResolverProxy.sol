// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IResolverProxy {
    struct Rbac {
        bytes32 role;
        address[] members;
    }

    // When no function exists for function called
    error FunctionNotFound(bytes4 _functionSelector);
}
