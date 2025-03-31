// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '../HoldManagement.sol';

interface IHoldManagement {
    // ----- Structs -----

    struct HoldIdentifier {
        address tokenHolder;
        uint256 holdId;
    }
    struct Hold {
        uint256 amount;
        uint256 expirationTimestamp;
        address escrow;
        address to;
        bytes data;
    }
    struct HoldData {
        uint256 id;
        uint256 amount;
        uint256 expirationTimestamp;
        address escrow;
        address to;
        bytes data;
        bytes operatorData;
    }

    // ----- Events -----
    /**
     * @dev Emitted when a new Hold is created.
     * @param operator The address that initiated the Hold operation.
     * @param tokenHolder The holder of tokens to be held.
     * @param holdId The unique identifier of the Hold created.
     * @param hold The details of the Hold.
     * @param operatorData Additional data provided by the operator.
     */
    event HoldCreated(
        address indexed operator,
        address indexed tokenHolder,
        uint256 holdId,
        Hold hold,
        bytes operatorData
    );

    /**
     * @dev Emitted when the Hold is successfully executed.
     * @param tokenHolder The address of the token holder.
     * @param holdId The unique identifier of the Hold executed.
     * @param amount The amount of tokens involved in the Hold execution.
     * @param to The destination address receiving the tokens.
     */
    event HoldExecuted(address indexed tokenHolder, uint256 holdId, uint256 amount, address to);

    /**
     * @dev Emitted when the Hold is released (funds unlocked without being executed).
     * @param tokenHolder The address of the token holder.
     * @param holdId The unique identifier of the Hold released.
     * @param amount The amount of tokens that were released.
     */
    event HoldReleased(address indexed tokenHolder, uint256 holdId, uint256 amount);

    /**
     * @dev Emitted when a Hold is reclaimed (canceled) by the operator.
     * @param operator The address that reclaimed the Hold.
     * @param tokenHolder The address of the token holder.
     * @param holdId The unique identifier of the Hold reclaimed.
     * @param amount The amount of tokens reclaimed from the Hold.
     */
    event HoldReclaimed(address indexed operator, address indexed tokenHolder, uint256 holdId, uint256 amount);

    // ----- Functions -----

    /**
     * @dev Creates a new Hold in the system.
     * @param _hold The details of the Hold to be created.
     * @return success_ Whether the operation was successful.
     * @return holdId_ The unique identifier of the newly created Hold.
     */
    function createHold(Hold calldata _hold) external returns (bool success_, uint256 holdId_);

    /**
     * @dev Controller-specific function to create a Hold on behalf of another account.
     * @param _from The address of the token owner initiating the Hold.
     * @param _hold The details of the Hold to be created.
     * @param _operatorData Additional operator-related data.
     * @return success_ Whether the operation was successful.
     * @return holdId_ The unique identifier of the newly created Hold.
     */
    function controllerCreateHold(
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external returns (bool success_, uint256 holdId_);

    /**
     * @dev Executes a Hold, transferring the locked tokens.
     * @param _holdIdentifier The identifier/details of the Hold to execute.
     * @param _to The recipient address of the tokens.
     * @param _amount The amount of tokens to transfer.
     * @return success_ Whether the operation was successful.
     */
    function executeHold(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external returns (bool success_);

    /**
     * @dev Releases the locked funds from a Hold, without executing a transfer.
     * @param _holdIdentifier The identifier/details of the Hold to release.
     * @param _amount The amount of tokens to release.
     * @return success_ Whether the operation was successful.
     */
    function releaseHold(HoldIdentifier calldata _holdIdentifier, uint256 _amount) external returns (bool success_);

    /**
     * @dev Allows the operator to reclaim the funds from an active Hold.
     * @param _holdIdentifier The identifier/details of the Hold to reclaim.
     * @return success_ Whether the operation was successful.
     */
    function reclaimHold(HoldIdentifier calldata _holdIdentifier) external returns (bool success_);

    /**
     * @dev Retrieves the total amount of tokens held in all Holds across the system.
     * @return amount_ The total held token amount.
     */
    function getHeldAmount() external view returns (uint256 amount_);

    /**
     * @dev Retrieves the total amount of tokens held by a specific user.
     * @param _tokenHolder The address of the token holder.
     * @return amount_ The total held token amount for the user.
     */
    function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @dev Retrieves the number of Holds specific to a token holder.
     * @param _tokenHolder The address of the token holder.
     * @return holdCount_ The total number of Holds for the user.
     */
    function getHoldCountFor(address _tokenHolder) external view returns (uint256 holdCount_);

    /**
     * @dev Retrieves a paginated list of Hold IDs for a specific token holder.
     * @param _tokenHolder The address of the token holder.
     * @param _pageIndex The index of the page to retrieve.
     * @param _pageLength The number of items per page.
     * @return holdsId_ An array of Hold IDs for the user.
     */
    function getHoldsIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory holdsId_);

    /**
     * @dev Retrieves detailed information about a specific Hold.
     * @param _holdIdentifier The identifier/details of the Hold to retrieve.
     * @return amount_ The amount of tokens in the Hold.
     * @return expirationTimestamp_ The expiration time of the Hold.
     * @return escrow_ The escrow address managing the Hold.
     * @return destination_ The destination address for the Hold.
     * @return data_ Additional Hold-related data.
     * @return operatorData_ Additional operator-provided data.
     */
    function getHoldFor(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_
        );
}
