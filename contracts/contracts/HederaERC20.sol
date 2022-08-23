// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./HederaERC20.sol";
import "./HTSTokenOwner.sol";


contract HederaERC20 is IHederaERC20, Initializable, IERC20Upgradeable{
    using SafeERC20Upgradeable for IERC20Upgradeable;


    HTSTokenOwner HTSTokenOwnerAddress;
    address tokenAddress; 

    function initialize () 
        payable 
        external initializer {
    }
     
    function name() 
        external 
        view 
        returns(string memory) 
    {
        return IERC20MetadataUpgradeable(tokenAddress).name();        
    }
    
    function symbol() 
        external 
        view 
        returns(string memory) 
    {
        return IERC20MetadataUpgradeable(tokenAddress).symbol();
    }

    function decimals() 
        public 
        view 
        returns (uint8) 
    {
        return IERC20MetadataUpgradeable(tokenAddress).decimals();
    }

    function totalSupply() 
        external 
        view 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (uint256) 
    {
        return IERC20Upgradeable(tokenAddress).totalSupply();
    }

    function balanceOf(address account) 
        public 
        view 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (uint256) 
    {
        return IERC20Upgradeable(tokenAddress).balanceOf(account);
    }
    
    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) 
        external         
    {
        require(tokenAddress == address(0), "Token address already defined");

        HTSTokenOwnerAddress = _htsTokenOwnerAddress;
        tokenAddress = _tokenAddress;
    }

    function getTokenAddress()  
        external 
        view 
        returns (address) 
    {
        return tokenAddress;
    }

    function mint(address account, uint256 amount) 
        external        
        returns (bool) 
    {         
        (bool success) = HTSTokenOwnerAddress.mintToken(tokenAddress, amount);
        require(success, "Minting error");

        return _transfer(address(HTSTokenOwnerAddress), account, amount);
    }

    function burn(uint256 amount) 
        public 
        returns (bool) 
    {
        _transfer(msg.sender, address(HTSTokenOwnerAddress), amount);
        return HTSTokenOwnerAddress.burnToken(tokenAddress, amount);
    }

    function _transfer(address from, address to, uint256 amount) 
        internal 
        returns (bool) 
    {
        require(balanceOf(from) >= amount, "Insufficient token balance");
    
        bool result = HTSTokenOwnerAddress.transfer(tokenAddress, from, to, amount);
        require(result, "Transfer error");
    
        return true;
    }


    function transfer(address to, uint256 amount) 
        external 
        returns (bool) {
        return true;
    }

 
    function allowance(address owner, address spender) 
        external 
        view 
        returns (uint256){
        return 0;
    }


    function approve(address spender, uint256 amount) 
        external 
        returns (bool){
         return true;
    }

    function transferFrom( address from,  address to, uint256 amount) 
        external 
        returns (bool){
         return true;
    }

}