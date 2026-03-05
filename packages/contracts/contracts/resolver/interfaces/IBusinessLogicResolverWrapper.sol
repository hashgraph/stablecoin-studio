// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title Contracts Repository
/// @notice This contract is used to register and resolve Business Logics (aka contracts) addresses using
///          a bytes32 as key.
///
///			All registered Business Logics must have the same number of versions, so that they have a common "latest"
///			version and any previous version can be resolved for any existing Business Logic no matter when it was
///			added to the register.
///         The idea is that consumers should use Business Logics belonging to the same version since those are
/// 		considered fully compatible.
///			Registering a business logic (register = update its latest version or add it to the registry) will increase the
///			latest version for all Business Logics by 1.
interface IBusinessLogicResolverWrapper {
    error BusinessLogicVersionDoesNotExist(uint256 version);
    error BusinessLogicNotActive(bytes32 businessLogicKey);
    error BusinessLogicKeyDuplicated(bytes32 businessLogicKey);
    error AllBusinessLogicKeysMustBeenInformed();
    error ZeroKeyNotValidForBusinessLogic();
    error ZeroAddressNotValidForBusinessLogic();
}
