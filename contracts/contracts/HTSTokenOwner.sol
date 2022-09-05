// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./hts-precompile/HederaTokenService.sol";
import "./IHTSTokenOwner.sol";
import "./TokenOwner.sol";

contract HTSTokenOwner is IHTSTokenOwner, HederaTokenService {
    using SafeERC20Upgradeable for IERC20Upgradeable; 

    address public erc20address;

    modifier onlyHederaERC20() {
        require (msg.sender == erc20address, "Caller is not HederaERC20 contract");
        _;
    }

    constructor() {
    }

    function setERC20Address(address _erc20address) 
        external 
    {
        require(erc20address == address(0), "ERC20 address already defined");
        erc20address = _erc20address;
    }

    function mintToken(address tokenAddress, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        (int256 responseCode, uint64 newTotalSupply, int64[] memory serialNumbers) = HederaTokenService
            .mintToken(tokenAddress, uint64(amount), new bytes[](0));
        return _checkResponse(responseCode);
    }

    function burnToken(address tokenAddress, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        (int256 responseCode, uint64 newTotalSupply) = HederaTokenService
            .burnToken(tokenAddress, uint64(amount), new int64[](0));
        return _checkResponse(responseCode);
    }

    function transfer(address tokenAddress, address from, address to, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 transferResponse = HederaTokenService.transferToken(tokenAddress, from, to, int64(int256(amount)));
        return _checkResponse(transferResponse);
    }

    function transfer(address tokenAddress,address to, uint256 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        address tokenAddress = tokenAddress;
        int256 transferResponse = HederaTokenService.transferToken(tokenAddress, address(this), to, int64(int256(amount)));
        return _checkResponse(transferResponse);
    }

    function wipeToken(address tokenAddress, address account, uint32 amount) 
        external 
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 responseCode = HederaTokenService.wipeTokenAccount(tokenAddress, account, uint32(amount));
        return _checkResponse(responseCode);
    }
    function tranferContract(address tokenAddress,address to, uint256 amount) 
        external
        override
        onlyHederaERC20() 
        returns (bool) 
    {
        int256 transferResponse = HederaTokenService.transferToken(tokenAddress, address(this), to, int64(int256(amount)));
        return _checkResponse(transferResponse);
    }


    function _checkResponse(int256 responseCode) 
        internal 
        returns (bool) 
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
        return true;
    }

    function toString(bytes memory data) 
        public 
        pure 
        returns(string memory) 
    {
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint i = 0; i < data.length; i++) {
            str[2+i*2] = alphabet[uint(uint8(data[i] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(data[i] & 0x0f))];
        }
        return string(str);
    }

}