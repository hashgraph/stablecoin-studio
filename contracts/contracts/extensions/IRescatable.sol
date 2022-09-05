// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;


interface IRescatable   {
    /**
    * @dev Emitted when `value` tokens are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     */
    event TokenRescued (address rescuer, address tokenId, uint256 amount, uint256 oldBalance);
    
    /**
    * @dev Emitted when `value` habars are moved from contract account (`from`) to
     * rescuer (`to`).
     *
     * Note that `value` may be zero.
     */
    event HbarRescued  (address rescuer, uint256 amount, uint256 oldAmount);

    /**
    * @dev Rescue `value` `tokenId` from contractTokenOwner to rescuer
    * 
    * Must be protected with isRescuer()
    */
    function rescueToken( uint256 amount) external;
    
    /**
    * @dev Rescue `value` hbar from contractTokenOwner to rescuer
    * Must be protected with isRescuer()
    */
    function rescueHbar(uint256 amount) external ;
}