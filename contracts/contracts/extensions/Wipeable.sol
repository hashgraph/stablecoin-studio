// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;

import "./TokenOwner.sol";
import "./Roles.sol";
import "./Interfaces/IWipeable.sol";
import "../hts-precompile/IHederaTokenService.sol";

abstract contract Wipeable is IWipeable, TokenOwner, Roles {

    /**
    * @dev Operation to wipe a token amount (`amount`) from account (`account`).    
    *
    * Validate that there is sufficient token balance before wipe.
    *
    * Only the 'WIPE ROLE` can execute
    * Emits a TokensWiped event
    * 
    * @param account The address of the account where to wipe the token
    * @param amount The number of tokens to wipe
    */
    function wipe(address account, uint32 amount) 
        external       
        onlyRole(_getRoleId(roleName.WIPE))  
        returns (bool)
    {      
        require(_balanceOf(account) >= amount, "Insufficient token balance for wiped"); 

        emit TokensWiped (msg.sender, _getTokenAddress(), account, amount);

        int256 responseCode = IHederaTokenService(precompileAddress).wipeTokenAccount(_getTokenAddress(), account,  amount);

        bool success = _checkResponse(responseCode);

        return success;
    }

}