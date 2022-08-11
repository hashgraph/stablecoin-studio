// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

//import "@openzeppelin/contracts-upgradeable/utils/introspection/ERC165CheckerUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./TokenSupplyInterface.sol";

/**
 * @title The Supply Controller
 * @notice The Supply Controller manages the Approver Supplier pairs
 * allowing for Suppliers to mint and burn balances on the linked
 * TokenSupplyInterface enabled ERC20 compliant token.
 * 
 * Approver Supplier pairs are unique (1 to 1). A Supplier may not
 * be paired with more than one Approver and conversely an Approver
 * may not be paired with more than one Supplier.
 * 
 * The Supply Controller affords Approvers the means of managing 
 * Supplier Minting Allowances via the increment and decrement
 * minting allowance functions.
 */
contract SupplyController is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant CONTRACT_ADMIN_ROLE = keccak256("CONTRACT_ADMIN_ROLE");   
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    bytes32 public version;
    TokenSupplyInterface public tokenContract;

    /**
     * The combination of approverToSupplier and supplierToApprover mappings 
     * serve to enable Approver Supplier pair uniqueness (1 to 1)
     */
    mapping(address => address) internal approverToSupplier;
    mapping(address => address) internal supplierToApprover;

    /**
     * @notice Thrown when an inherited function has been disabled
     */
    error InheritedFunctionDisabled();

    /**
     * @notice Emitted when an `approver` `supplier` pair is added
     * 
     * @param sender The caller of the function that emitted the event
     * @param approver The approver that was added
     * @param supplier The supplier that was added
     */
    event ApproverSupplierAdded(address indexed sender, address indexed approver, address indexed supplier);

    /**
     * @notice Emitted when an `approver` `supplier` pair is removed.
     * 
     * @param sender The caller of the function that emitted the event
     * @param approver The approver that was removed
     * @param supplier The supplier that was removed
     */
    event ApproverSupplierRemoved(address indexed sender, address indexed approver, address indexed supplier);

    /**
     * @notice Emitted when an approver increased the allowance of a `supplier`
     * 
     * Requirements
     * - This event will not emit the old supplier allowance and new supplier allowance 
     *   as this will be emitted by the token
     * 
     * @param sender The approver who increased the supplier allowance
     * @param supplier The supplier whose supplier allowance was increased
     * @param amount The amount the supplier's allowance was increased by
     */
    event AllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount);

    /**
     * @notice Emitted when an approver decreased the allowance of a `supplier`
     * 
     * Requirements
     * - This event will not emit the old supplier allowance and new supplier allowance 
     *   as this will be emitted by the token
     * 
     * @param sender The approver who decreased the supplier allowance
     * @param supplier The supplier whose supplier allowance was decreased
     * @param amount The amount the supplier's allowance was decreased by
     */
    event AllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount);


    /**
     * @notice Initialize imported libraries, set version and token contract, configures role admins and 
     * sets roles per parameters
     * 
     * Requirements
     * - Must only be called once like a constructor
     * - Token can not be the zero address
     * - Token must support ERC165
     * - Token must support the interface TokenSupplyInterfaceV1
     * - Initial Master can not be the zero address
     * - Initial Contract Admin can not be the zero address
     * - Initial Pauser can not be the zero address
     * - Initial Upgrader can not be the zero address
     * 
     * @param token The TokenSupplyInterfaceV1 token to be managed by the Supply Controller
     * @param initialMaster Account to be granted the DEFAULT_ADMIN_ROLE, PAUSER_ROLE and UPGRADER_ROLE
     * @param initialContractAdmin Account to be granted the CONTRACT_ADMIN_ROLE    
     * @param initialUpgrader Account to be granted the UPGRADER_ROLE
     */
    function initialize(
        TokenSupplyInterface token,
        address initialMaster,
        address initialContractAdmin,
        address initialUpgrader        
    ) external initializer {
        require(address(token) != address(0), "Token can not be the zero address");
                
        require(initialMaster != address(0), "Initial Master can not be the zero address");
        require(initialContractAdmin != address(0), "Initial Contract Admin can not be the zero address");
        require(initialUpgrader != address(0), "Initial Upgrader can not be the zero address");
        
        __AccessControl_init();
        __UUPSUpgradeable_init();

        version = "1";
        tokenContract = token;
       
        _setRoleAdmin(APPROVER_ROLE, CONTRACT_ADMIN_ROLE);
         
        _grantRole(CONTRACT_ADMIN_ROLE, initialContractAdmin);
        _grantRole(DEFAULT_ADMIN_ROLE, initialMaster);
        _grantRole(UPGRADER_ROLE, initialMaster);
        _grantRole(UPGRADER_ROLE, initialUpgrader);
    }

    /**
     * @notice Disables the ability for the calling `account` to renounce their `role`
     *
     * We explicitly opt-out of renounceRole inherited via AccessControlUpgradeable
     * Any calls to this function revert
     *
     * @param role The role to be renounced
     * @param account The account renouncing the role 
     */
    function renounceRole(bytes32 role, address account) 
        public 
        virtual 
        override 
    {
        revert InheritedFunctionDisabled();
    }
    
    /**
     * @notice Adds an `approver` and assigns them a `supplier`
     * 
     * Emits an ApproverSupplierAdded event
     * 
     * Requirementsf02df2b
     * - Must throw when the contract is paused
     * - Only the CONTRACT_ADMIN_ROLE can execute
     * - The `approver` must not be the zero address
     * - The `supplier` must not be the zero address
     * - The `approver` must not be part of an existing Approver Supplier pair
     * - The `supplier` must not be part of an existing Approver Supplier pair
     * 
     * @param approver Address of the approver to add
     * @param supplier Address of the supplier to be assigned to
     * @return True if successful
     */
    function addApproverSupplier(address approver, address supplier) 
        external 
        virtual 
        onlyRole(CONTRACT_ADMIN_ROLE) 
        returns (bool)
    {
        
        require(approver != address(0), "Approver address can not be zero");
        require(supplier != address(0), "Supplier address can not be zero");
        require(approverToSupplier[approver] == address(0), "Approver already linked to a supplier");
        require(supplierToApprover[supplier] == address(0), "Supplier already linked to an approver");
        
        approverToSupplier[approver] = supplier;
        supplierToApprover[supplier] = approver;
        grantRole(APPROVER_ROLE, approver);        
        tokenContract.grantRole(tokenContract.SUPPLIER_ROLE(), supplier);
        emit ApproverSupplierAdded(msg.sender, approver, supplier);
        return true;
    }

    /**
     * @notice Removes an `approver` and sets its supplier to 0x00
     * 
     * Emits an ApproverSupplierRemoved event
     * 
     * Given Approver Supplier pairs as unique (1 to 1) we need only one
     * element of the pair (approver in this instance) to identify the 
     * pair to be removed.
     * 
     * Requirements
     * - Must throw when the contract is paused
     * - Only the CONTRACT_ADMIN_ROLE can execute
     * - The `approver` must not be the zero address
     * - The `approver` must be part of an existing Approver Supplier pair
     * 
     * @param approver Address of the approver to remove
     * @return True if successful
     */
    function removeApproverSupplier(address approver) 
        external 
        virtual 
        onlyRole(CONTRACT_ADMIN_ROLE) 
        returns (bool)
    {
        address supplier = approverToSupplier[approver];
        require(approver != address(0), "Approver address can not be zero");
        require(supplier != address(0), "Approver Supplier pair does not exist");

        approverToSupplier[approver] = address(0);
        supplierToApprover[supplier] = address(0);
        revokeRole(APPROVER_ROLE, approver);
        tokenContract.revokeRole(tokenContract.SUPPLIER_ROLE(), supplier);
        tokenContract.resetSupplierAllowance(supplier);
        emit ApproverSupplierRemoved(msg.sender, approver, supplier);
        return true;
    }

    /**
     * @notice Increases the minting allowance of the approver's supplier, enabling them to mint more
     * 
     * Emits an AllowanceIncreased event
     * 
     * The Supply Controller manages the Supplier Allowance of the token contract. The token's 
     * decimal precision is defined in token.decimals(). This function does not alter the value
     * or scale of the amount and as such, it is understood the caller is aware of applicable  
     * decimal precision.
     * 
     * Requirements
     * - Must throw when the contract is paused
     * - Only the APPROVER_ROLE can execute
     * - The `amount` must be greater than 0
     * - An Approver Supplier pair must be added to the token contract
     * - The linked Supplier must have the SUPPLIER_ROLE in the token contract
     * 
     * @param amount The amount to add to the supplier's current minting allowance
     * @return True if successful
     */
    function increaseSupplierAllowance(uint256 amount) 
        external 
        virtual 
        onlyRole(APPROVER_ROLE) 
        returns (bool)
    {
        require(amount > 0, "Amount must be greater than zero");
        
        address supplier = approverToSupplier[msg.sender];
        require(supplier != address(0), "Approver Supplier pair does not exist");
        require(tokenContract.hasRole(tokenContract.SUPPLIER_ROLE(), supplier),"Missing token contract supplier role");

        tokenContract.increaseSupplierAllowance(supplier, amount);
        emit AllowanceIncreased(msg.sender, supplier, amount);
        return true;
    }

    /**
     * @notice Decreases the minting allowance of the approver's supplier, enabling them to mint less
     * 
     * Emits an AllowanceDecreased event
     * 
     * The Supply Controller manages the Supplier Allowance of the token contract. The token's 
     * decimal precision is defined in token.decimals(). This function does not alter the value
     * or scale of the amount and as such, it is understood the caller is aware of applicable  
     * decimal precision.
     * 
     * Requirements
     * - Must throw when the contract is paused
     * - Only the APPROVER_ROLE can execute
     * - The `amount` must be greater than 0
     * - An Approver Supplier pair must be added to the token contract
     * - The linked Supplier must have the SUPPLIER_ROLE in the token contract
     * 
     * @param amount The amount to subtract from the supplier's current minting allowance
     * @return True if successful
     */
    function decreaseSupplierAllowance(uint256 amount) 
        external 
        virtual 
        onlyRole(APPROVER_ROLE) 
        returns (bool)
    {
        require(amount > 0, "Amount must be greater than zero");
        address supplier = approverToSupplier[msg.sender];
        require(supplier != address(0), "Approver Supplier pair does not exist");
        require(tokenContract.hasRole(tokenContract.SUPPLIER_ROLE(), supplier),"Missing token contract supplier role");

        tokenContract.decreaseSupplierAllowance(supplier, amount);
        emit AllowanceDecreased(msg.sender, supplier, amount);
        return true;
    }

    /**
     * @notice Gets the supplier that is assigned to the `approver`
     * 
     * @param approver Address of the approver that you want to get the supplier of
     * @return The address of the supplier or zero address for invalid Approver Supplier pairs
     */
    function getSupplier(address approver) 
        external 
        view 
        virtual 
        returns (address) 
    {
        return approverToSupplier[approver];
    }

    /**
     * @notice Gets the approver that is assigned to the `supplier`
     * 
     * @param supplier Address of the supplier that you want to get the approver of
     * @return The address of the approver or zero address for invalid Approver Supplier pairs
     */
    function getApprover(address supplier) 
        external 
        view 
        virtual 
        returns (address) 
    {
        return supplierToApprover[supplier];
    }

     /**
     * @notice Gets the `supplier` allowance for minting
     * 
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     */
    function supplierAllowance(address supplier) 
        external 
        view 
        virtual 
        returns (uint256) 
    {
        return tokenContract.supplierAllowance(supplier);
    }

    /**
     * @notice Gets the token contract address
     * 
     * @return The address of the token contract
     */
    function getTokenContractAddress() 
        external 
        view 
        virtual 
        returns (address) 
    {
        return address(tokenContract);
    }

    /**
     * @notice Checks the caller is authorized to upgrade the contract
     * 
     * Should revert when the caller is not authorized
     * 
     * Requirements
     * - Only the UPGRADER_ROLE can execute
     *
     * @param newImplementation The address of the new logic contract
     */
    function _authorizeUpgrade(address newImplementation) internal virtual override onlyRole(UPGRADER_ROLE) {}

}