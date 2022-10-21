// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./hts-precompile/HederaTokenService.sol";
import "./IHederaERC20.sol";
import "./extensions/Mintable.sol";
import "./extensions/Burnable.sol";
import "./extensions/Wipeable.sol";
import "./extensions/Rescatable.sol";
import "./Roles.sol";

contract HederaERC20 is IHederaERC20, HederaTokenService, Initializable, IERC20Upgradeable, 
                       Mintable, Burnable, Wipeable, Rescatable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    function initialize () 
        external 
        payable 
        initializer 
    {
        __AccessControl_init();       
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        grantUnlimitedSupplierRole(msg.sender);
        _grantRole(BURN_ROLE, msg.sender);
        _grantRole(RESCUE_ROLE, msg.sender);
        _grantRole(WIPE_ROLE, msg.sender);
        
    }

    /**
     * @dev Returns the name of the token
     * 
     * @return string The the name of the token
     */
    function name() 
        external 
        view 
        returns(string memory) 
    {
        return IERC20MetadataUpgradeable(_tokenAddress).name();        
    }

    /**
     * @dev Returns the symbol of the token
     * 
     * @return string The the symbol of the token
     */
    function symbol() 
        external 
        view 
        returns(string memory) 
    {
        return IERC20MetadataUpgradeable(_tokenAddress).symbol();
    }

    /**
     * @dev Returns the number of decimals of the token
     * 
     * @return uint8 The number of decimals of the token
     */
    function decimals() 
        public 
        view 
        returns (uint8) 
    {
        return IERC20MetadataUpgradeable(_tokenAddress).decimals();
    }

    /**
     * @dev Returns the total number of tokens that exits
     * 
     * @return uint256 The total number of tokens that exists
     */
    function totalSupply() 
        external 
        view 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (uint256) 
    {
        return IERC20Upgradeable(_tokenAddress).totalSupply();
    }

    /**
     * @dev Returns the number tokens that an account has
     *
     * @param account The address of the account to be consulted
     *
     * @return uint256 The number number tokens that an account has
     */
    function balanceOf(address account) 
        public 
        view 
        override(IHederaERC20, IERC20Upgradeable, Burnable) 
        returns (uint256) 
    {
        return IERC20Upgradeable(_tokenAddress).balanceOf(account);
    }

    /**
     * @dev Associates a account to the token
     *
     * @param adr The address of the account to associate
     *
     * @return bool True if the account has been successfully associated with the token
     */
    function associateToken(address adr) 
        public 
        returns (bool) 
    {         
        int256 responseCode = HederaTokenService.associateToken(adr, _tokenAddress);
        return _checkResponse(responseCode);        
    }

    /**
     * @dev Dissociates an account from the token
     *
     * @param adr The address of the account to dissociate
     *
     * @return bool True if the account has been successfully dissociated from the token
     */
    function dissociateToken(address adr) 
        public 
        returns (bool) 
    {         
        int256 responseCode = HederaTokenService.dissociateToken(adr, _tokenAddress);
        return _checkResponse(responseCode);        
    }

    /**
     * @dev Transfers an amount of tokens from and account to another account
     *
     * @param from The address the tokens are transferred from
     * @param to The address the tokens are transferred to
     * @return bool True if tokens were successfully transferred 
     */
    function _transfer(address from, address to, uint256 amount) 
        internal 
        override
        returns (bool) 
    {
        require(balanceOf(from) >= amount, "Insufficient token balance");
    
        bool result = _htsTokenOwnerAddress.transfer(_tokenAddress, from, to, amount);
        require(result, "Transfer error");
    
        return true;
    }

    /**
    * @dev Function not already implemented
    */
    function transfer(address /* to */, uint256 /* amount */) 
        external 
        pure
        returns (bool)
    {
        require(false, "function not already implemented");
        return true;
    }

    /**
    * @dev Function not already implemented
    */
    function allowance(address /* owner */, address /* spender */) 
        external 
        pure 
        returns (uint256)
    {
        require(false, "function not already implemented");
        return 0;
    }

    /**
    * @dev Function not already implemented
    */
    function approve(address /* spender */, uint256 /* amount */) 
        external 
        pure
        returns (bool)
    {
        require(false, "function not already implemented");
        return true;
    }

    /**
    * @dev Function not already implemented
    */
    function transferFrom(address /* from */,  address /* to */, uint256 /* amount */) 
        external 
        pure
        returns (bool)
    {
        require(false, "function not already implemented");
        return true;
    }
    
    /**
    * @dev Transforms the response from a HederaResponseCodes to a boolean
    *
    * @param responseCode The Hedera response code to transform
    * @return bool True if successful
    */
    function _checkResponse(int256 responseCode) 
        internal 
        pure
        returns (bool) 
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
        return true;
    }
}