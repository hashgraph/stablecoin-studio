// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./TokenOwner.sol";
import "./Roles.sol";
import "./Interfaces/IRescatable.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Rescatable is IRescatable, TokenOwner, Roles {
    
    /**
    * @dev Rescue `value` `tokenId` from contractTokenOwner to rescuer
    * 
    * Must be protected with isRescuer()
    *
    * @param amount The number of tokens to rescuer
    */
    function rescue(uint256 amount)
        external
        onlyRole(_getRoleId(roleName.RESCUE)) 
        override(IRescatable)
        returns (bool)
    {
        require(_balanceOf(address(this)) >= amount, "Amount must not exceed the token balance");
        
        emit TokenRescued (msg.sender, _getTokenAddress(), amount);

        int256 responseCode = IHederaTokenService(precompileAddress).transferToken(_getTokenAddress(), address(this), msg.sender, int64(int256(amount)));

        bool success = _checkResponse(responseCode);

        return success;
    }

}