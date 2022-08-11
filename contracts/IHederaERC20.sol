// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./HTSTokenOwner.sol";

interface IHederaERC20 {

    function setTokenAddress(HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external; 

    function getTokenAddress() external view returns (address);

    function name() external view returns(string memory);
    
    function symbol() external view returns(string memory);

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function decimals() external view returns (uint8);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function mint(address account, uint256 amount) external returns (bool);  

    function burn(uint256 amount) external returns (bool);

    function burnFrom(address account, uint256 amount) external returns (bool);

    function associateToken(address adr) external returns (bool);

    function dissociateToken(address adr) external returns (bool);

    function supplierAllowance(address supplier) external view  returns (uint256);
    
    function resetSupplierAllowance(address supplier) external;   

    function increaseSupplierAllowance(address supplier, uint256 amount) external;

    function decreaseSupplierAllowance(address supplier, uint256 amount) external;

    function tokenRescue(IERC20Upgradeable token, uint256 amount) external;

    function hbarRescue(uint256 amount) external;  

}
