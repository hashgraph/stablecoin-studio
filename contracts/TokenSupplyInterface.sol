// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/access/IAccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

/**
 * @title The Token Supply Interface
 * @author ANZ Bank Digital Asset Services
 * @notice The Token Supply Interface details the interaction surface serving
 * the delegated Supply Control along with the accompanying access control role
 * definitions.
 */
abstract contract TokenSupplyInterface is IAccessControlUpgradeable, IERC165Upgradeable {
    bytes32 public constant SUPPLY_CONTROLLER_ROLE = keccak256("SUPPLY_CONTROLLER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");

    /**
     * @notice Reset a supplier's allowance to 0
     * 
     * @param supplier The address of the supplier
     */
    function resetSupplierAllowance(address supplier) external virtual;

    /**
     * @notice Increases the minting allowance of the `supplier`, increasing the `amount` the `supplier` can mint
     * 
     * @param supplier The address of the supplier
     * @param amount The amount to add to the supplier's current minting allowance
     */
    function increaseSupplierAllowance(address supplier, uint256 amount) external virtual;

    /**
     * @notice Decreases the minting allowance of the `supplier`, reducing the `amount` that the `supplier` can mint
     * 
     * @param supplier The address of the supplier
     * @param amount The amount to subtract from the supplier's current minting allowance
     */
    function decreaseSupplierAllowance(address supplier, uint256 amount) external virtual;

    /**
     * @notice Gets the `supplier` allowance for minting
     * 
     * @param supplier The address of the supplier
     * @return The number of tokens allowed to be minted
     */
    function supplierAllowance(address supplier) external view virtual returns (uint256);
}
