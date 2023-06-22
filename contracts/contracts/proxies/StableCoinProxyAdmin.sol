// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import {
    ProxyAdmin
} from '@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol';
import {Ownable2Step} from '@openzeppelin/contracts/access/Ownable2Step.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';

contract StableCoinProxyAdmin is Ownable, ProxyAdmin, Ownable2Step {
    constructor(address initialOwner) Ownable2Step() {
        _transferOwnership(initialOwner);
    }

    function transferOwnership(
        address newOwner
    ) public override(Ownable, Ownable2Step) onlyOwner {
        Ownable2Step.transferOwnership(newOwner);
    }

    function _transferOwnership(
        address newOwner
    ) internal override(Ownable, Ownable2Step) {
        Ownable2Step._transferOwnership(newOwner);
    }
}
