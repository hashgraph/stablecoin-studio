// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IWipeable   {
      
    event TokensWiped (address token, address account, uint32 amount);

    function wipe(address account, uint32 amount) external returns (bool) ;
    
}