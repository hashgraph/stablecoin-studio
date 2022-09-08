// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


interface IRescatable   {
    /**
    * @dev Emitted when `value` tokens are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     *
     * @param rescuer The caller of the function that emitted the event
     * @param tokenId The token that was rescued
     * @param amount The amount of the token that was rescued
     * @param oldBalance The contract's balance of the token before the rescue
     */
    event TokenRescued (address rescuer, address tokenId, uint256 amount, uint256 oldBalance);
    
    /**
    * @dev Emitted when `value` habars are moved from contract account (`from`) to
    * rescuer (`to`).
    *     
    * @param rescuer The caller of the function that emitted the event
    * @param amount The amount of the hbar that was rescued
    * @param oldAmount The hbar balance before the rescue
    */
    event HbarRescued  (address rescuer, uint256 amount, uint256 oldAmount);

    /**
    * @dev Rescue `value` tokens from contractTokenOwner to rescuer
    * 
    * @param amount The number of tokens to rescuer
    */
    function rescueToken( uint256 amount) external;
    
    /**
    * @dev Rescue `value` hbar from contractTokenOwner to rescuer
    *
    * @param amount The amount of hbar to rescuer
    */
    function rescueHbar(uint256 amount) external ;
}