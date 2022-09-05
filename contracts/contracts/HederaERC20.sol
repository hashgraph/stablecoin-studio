// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./hts-precompile/HederaTokenService.sol";
import "./IHederaERC20.sol";
import "./extensions/Mintable.sol";
import "./extensions/Wipeable.sol";
import "./extensions/Rescatable.sol";


contract HederaERC20 is IHederaERC20, HederaTokenService, Initializable, IERC20Upgradeable, Mintable, Wipeable, Rescatable{
    using SafeERC20Upgradeable for IERC20Upgradeable;

    function initialize () 
        payable 
        external 
        initializer 
    {
        __AccessControl_init();       
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_SUPPLIER_ROLE, msg.sender);
        grantUnlimitedSupplierRole(msg.sender);
        _grantRole(ROLE_RESCUE, msg.sender);
        _grantRole(WIPE_ROLE, msg.sender);
        
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

    function associateToken(address adr) 
        public 
        returns (bool) 
    {         
        int256 responseCode = HederaTokenService.associateToken(adr, tokenAddress);
        return _checkResponse(responseCode);        
    }

    function dissociateToken(address adr) 
        public 
        returns (bool) 
    {         
        int256 responseCode = HederaTokenService.dissociateToken(adr, tokenAddress);
        return _checkResponse(responseCode);        
    }
    
    function _transfer(address from, address to, uint256 amount) 
        internal 
        override
        returns (bool) 
    {
        require(balanceOf(from) >= amount, "Insufficient token balance");
    
        bool result = HTSTokenOwnerAddress.transfer(tokenAddress, from, to, amount);
        require(result, "Transfer error");
    
        return true;
    }

    function burn(uint256 amount) 
        public 
        returns (bool) 
    {
        require(false, "function not already implemented");
    }

    function transfer(address to, uint256 amount) 
        external 
        returns (bool)
    {
        require(false, "function not already implemented");
    }

    function allowance(address owner, address spender) 
        external 
        view 
        returns (uint256)
    {
        require(false, "function not already implemented");
    }


    function approve(address spender, uint256 amount) 
        external 
        returns (bool)
    {
         require(false, "function not already implemented");
    }

    function transferFrom( address from,  address to, uint256 amount) 
        external 
        returns (bool)
    {
         require(false, "function not already implemented");
    }
    
    function _checkResponse(int256 responseCode) 
        internal 
        returns (bool) 
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
        return true;
    }
}