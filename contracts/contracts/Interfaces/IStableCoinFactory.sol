
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IStableCoinFactory {

    struct tokenStruct{
        string tokenName;
        string tokenSymbol;
        bool freeze;
        bool supplyType;
        uint32 tokenMaxSupply;
        uint tokenInitialSupply;
        uint tokenDecimals;
        bytes senderPublicKey;
    }

    function deployStableCoin(
        tokenStruct calldata requestedToken
    ) external payable returns (address, address);
}