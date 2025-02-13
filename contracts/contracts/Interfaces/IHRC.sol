// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// Based on the HIP-719

interface IHRC {
    function associate() external returns (int64 responseCode);

    function dissociate() external returns (int64 responseCode);

    function isAssociated() external view returns (bool);
}
