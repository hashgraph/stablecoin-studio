// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./hip-206/HederaTokenService.sol";
import "./TokenSupplyInterface.sol";
import "./HTSTokenOwner.sol";
import "./IHederaERC20.sol";

contract HederaERC20 is IHederaERC20, Initializable, IERC20Upgradeable, HederaTokenService, AccessControlUpgradeable, UUPSUpgradeable, TokenSupplyInterface {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant CONTRACT_ADMIN_ROLE = keccak256("CONTRACT_ADMIN_ROLE");
    bytes32 public constant RESCUER_ROLE = keccak256("RESCUER_ROLE");

    HTSTokenOwner HTSTokenOwnerAddress;
    address tokenAddress;    
    uint64 constant MAX_INT = 2**64 - 1;
    mapping(address => uint256) internal supplierAllowances;
    bytes32 public version;

    event SupplierAllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);
    event SupplierAllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance);

    event TokenRescued(address indexed sender, address indexed token, uint256 amount, uint256 oldBalance);
    event HbarRescued(address indexed sender, uint256 amount, uint256 oldBalance);

    event SupplierAllowanceReset(address indexed sender, address indexed supplier, uint256 oldAllowance, uint256 newAllowance);
    
    function initialize (
        address initialMaster,
        address initialContractAdmin,
        address initialUpgrader,
        address initialRescuer       
    ) payable external initializer {
        require(initialMaster != address(0), "Initial Master can not be the zero address");
        require(initialContractAdmin != address(0), "Initial Contract Admin can not be the zero address");
        require(initialUpgrader != address(0), "Initial Upgrader can not be the zero address");
        require(initialRescuer != address(0), "Initial Rescuer can not be the zero address");
       
        version = "1";
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _setRoleAdmin(SUPPLIER_ROLE, SUPPLY_CONTROLLER_ROLE);
        _setRoleAdmin(RESCUER_ROLE, CONTRACT_ADMIN_ROLE);

        _setupRole(DEFAULT_ADMIN_ROLE, initialMaster);
        _grantRole(UPGRADER_ROLE, initialMaster);

        _setupRole(CONTRACT_ADMIN_ROLE, initialContractAdmin);
        _grantRole(UPGRADER_ROLE, initialUpgrader);
        _setupRole(RESCUER_ROLE, initialRescuer);       
    }
   
    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        virtual 
        override(AccessControlUpgradeable, IERC165Upgradeable) 
        returns (bool) 
    {
        return interfaceId == type(TokenSupplyInterface).interfaceId || super.supportsInterface(interfaceId);
    }    

    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) 
        external 
        onlyRole(CONTRACT_ADMIN_ROLE) 
    {
        require(tokenAddress == address(0), "Token address already defined");

        HTSTokenOwnerAddress = _htsTokenOwnerAddress;
        tokenAddress = _tokenAddress;
    }

    function getTokenAddress() 
        external 
        override 
        view 
        returns (address) 
    {
        return tokenAddress;
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

    function decimals() 
        public 
        view 
        returns (uint8) 
    {
        return IERC20MetadataUpgradeable(tokenAddress).decimals();
    }

    function transfer(address to, uint256 amount) 
        external 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (bool) 
    {
       return _transfer(msg.sender, to, amount);
    }

    function allowance(address owner, address spender) 
        external 
        view 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (uint256) 
    {
        return _allowance(owner, spender);
    }

    function approve(address spender, uint256 amount) 
        external 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (bool) 
    {       
        return _approve(spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) 
        public 
        override(IHederaERC20, IERC20Upgradeable) 
        returns (bool) 
    {
        ( bool success, ) = tokenAddress.delegatecall(
            abi.encodeWithSelector(
                IERC20Upgradeable.transferFrom.selector,
                from,
                to, 
                amount
            )
        );
        return success;
    }

    function mint(address account, uint256 amount) 
        external 
        onlyRole(SUPPLIER_ROLE) 
        returns (bool) 
    {         
        uint256 mintAllowance = supplierAllowances[msg.sender];
        require(amount <= mintAllowance, "BaseToken: Not enough allowance to mint");

        supplierAllowances[msg.sender] = mintAllowance - amount;
        (bool success) = HTSTokenOwnerAddress.mintToken(tokenAddress, amount);
        require(success, "Minting error");

        return _transfer(address(HTSTokenOwnerAddress), account, amount);
    }

    function burn(uint256 amount) 
        public 
        onlyRole(SUPPLIER_ROLE) 
        returns (bool) 
    {
        _transfer(msg.sender, address(HTSTokenOwnerAddress), amount);
        return HTSTokenOwnerAddress.burnToken(tokenAddress, amount);
    }

    function burnFrom(address account, uint256 amount) 
        public 
        virtual 
        onlyRole(SUPPLIER_ROLE) 
        returns (bool) 
    {
        require(false, "Function not implemented"); 
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

    function supplierAllowance(address supplier) 
        external 
        view 
        virtual 
        override(IHederaERC20, TokenSupplyInterface) 
        returns (uint256) 
    {
        return supplierAllowances[supplier];
    }
    
    function resetSupplierAllowance(address supplier) 
        external 
        virtual 
        override(IHederaERC20, TokenSupplyInterface) 
        onlyRole(SUPPLY_CONTROLLER_ROLE) 
    {    
        uint256 oldAllowance = supplierAllowances[supplier];
        uint256 newAllowance = 0;
        supplierAllowances[supplier] = newAllowance;

        emit SupplierAllowanceReset(msg.sender, supplier, oldAllowance, newAllowance);
    }

    function increaseSupplierAllowance(address supplier, uint256 amount) 
        external 
        virtual 
        override(IHederaERC20, TokenSupplyInterface) 
        onlyRole(SUPPLY_CONTROLLER_ROLE) 
    {
        require(amount > 0, "Amount must be greater than zero");
        
        uint256 oldAllowance = supplierAllowances[supplier];
        uint256 newAllowance = oldAllowance + amount;  
        supplierAllowances[supplier] = newAllowance;
        
        emit SupplierAllowanceIncreased(msg.sender, supplier, amount, oldAllowance, newAllowance);
    }

    function decreaseSupplierAllowance(address supplier, uint256 amount) 
        external 
        virtual 
        override(IHederaERC20, TokenSupplyInterface) 
        onlyRole(SUPPLY_CONTROLLER_ROLE) 
    {
        require(amount > 0, "Amount must be greater than zero");
    
        uint256 oldAllowance = supplierAllowances[supplier];
        require(amount <= oldAllowance, "Amount must not exceed the supplier allowance");
        
        uint256 newAllowance = oldAllowance - amount;
        supplierAllowances[supplier] = newAllowance;
    
        emit SupplierAllowanceDecreased(msg.sender, supplier, amount, oldAllowance, newAllowance);
    }    

    function increaseAllowance(address spender, uint256 increment) 
        public 
        virtual 
        returns (bool) 
    {        
        address owner = msg.sender;
        uint256 amount = _allowance(owner, spender);
        return _approve(spender, (amount + increment));        
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) 
        public 
        virtual 
        returns (bool) 
    {
        address owner = msg.sender;
        uint256 currentAllowance = _allowance(owner, spender);
        require(currentAllowance >= subtractedValue, "Decreased allowance below zero");
        unchecked {
            _approve(spender, (currentAllowance - subtractedValue));
        }

        return true;        
    } 

    function tokenRescue(IERC20Upgradeable token, uint256 amount) 
        external 
        virtual 
        onlyRole(RESCUER_ROLE) 
    {
        uint256 oldBalance = balanceOf(address(HTSTokenOwnerAddress));
        require(oldBalance >= amount, "Amount must not exceed the token balance");
        
        token.safeTransfer(msg.sender, amount);
        
        emit TokenRescued(msg.sender, address(token), amount, oldBalance);
    }    

    function hbarRescue(uint256 amount) 
        external 
        virtual 
        onlyRole(RESCUER_ROLE) 
    {        
        uint256 oldBalance = address(this).balance;
        require(oldBalance >= amount, "Amount must not exceed the hbar balance");

        uint256 hbarAmount = amount * 100000000;
        (bool succeed, ) = msg.sender.call{value: hbarAmount}("");
        require(succeed, "BaseToken: Failed to rescue Hbar");
                
        emit HbarRescued(msg.sender, amount, oldBalance);
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
        
    function _allowance(address owner, address spender) 
        internal 
        view 
        returns (uint256) 
    {
        return IERC20Upgradeable(tokenAddress).allowance(owner, spender);
    }
    
    function _approve(address spender, uint256 amount) 
        internal 
        returns (bool) 
    {
        ( bool success, ) = tokenAddress.delegatecall(
            abi.encodeWithSelector(
                IERC20Upgradeable.approve.selector,
                spender,
                amount
            )
        );
        return success;
    }

    function _checkResponse(int256 responseCode) 
        internal 
        returns (bool) 
    {
        require(responseCode == HederaResponseCodes.SUCCESS, "Error");
        return true;
    }

    function _authorizeUpgrade(address newImplementation) internal virtual override onlyRole(UPGRADER_ROLE) {}   
}
