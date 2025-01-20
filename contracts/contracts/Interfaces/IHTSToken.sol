// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Based on the HIP-719

interface IHTSToken {
    function associate() external;
    function dissociate() external;
    function isAssociated() external view;
}
