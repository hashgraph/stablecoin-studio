// SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import "./Interfaces/IStableCoinFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract StableCoinFactoryWrapper is IStableCoinFactory, Ownable {

    address private _factory;

    event newFactoryAddress(address indexed previousFactory, address indexed newFactory);


    constructor() Ownable()
    {    
    }

    function changeFactory(address newFactory) external onlyOwner
    {
        require(newFactory != address(0), "Factory address cannot be address 0");
        address oldFactory = _factory;
        _factory = newFactory;
        emit newFactoryAddress(oldFactory, newFactory);
    }

    function getFactory() external view returns(address)
    {
        return _factory;
    }

    function deployStableCoin(
        tokenStruct calldata requestedToken
    ) external payable returns (address, address, address, address){
        return IStableCoinFactory(_factory).deployStableCoin{value: msg.value}(requestedToken);
    }


}