// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity 0.8.18;

contract RevertingReceiver {
    receive() external payable {
        revert("I reject all funds");
    }
}
