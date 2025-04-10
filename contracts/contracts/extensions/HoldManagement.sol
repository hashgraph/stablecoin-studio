// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

// solhint-disable max-line-length
import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {EnumerableSet} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {Roles} from './Roles.sol';
import {TokenOwner} from './TokenOwner.sol';
import {HoldBaseManagement} from './HoldBaseManagement.sol';
// solhint-enable max-line-length

contract HoldManagement is HoldBaseManagement, TokenOwner, Roles, IHoldManagement {
    using EnumerableSet for EnumerableSet.UintSet;

    /**
     * @dev Modifier to check if the hold has sufficient amount for the requested operation
     * @param holdAmount The amount currently held
     * @param requestedAmount The amount requested for the operation
     */
    modifier validAmount(int64 holdAmount, int64 requestedAmount) {
        if (holdAmount < requestedAmount) {
            revert InsufficientHoldAmount(requestedAmount, holdAmount);
        }
        _;
    }

    /**
     * @dev Modifier to check if a hold exists
     * @param _holdIdentifier The identifier of the hold
     */
    modifier validHold(HoldIdentifier calldata _holdIdentifier) {
        if (!_holdDataStorage().holdIdsByAccount[_holdIdentifier.tokenHolder].contains(_holdIdentifier.holdId)) {
            revert HoldNotFound(_holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
        _;
    }

    /**
     * @dev Modifier to check if a hold has not expired
     * @param expirationTimestamp The expiration timestamp of the hold
     */
    modifier nonExpired(uint256 expirationTimestamp) {
        if (expirationTimestamp < block.timestamp) {
            revert HoldNotExpired(expirationTimestamp);
        }
        _;
    }

    /**
     * @dev Modifier to check if the caller is the authorized escrow
     * @param escrow The address of the authorized escrow
     */
    modifier isEscrow(address escrow) {
        if (escrow != msg.sender) {
            revert UnauthorizedEscrow(msg.sender, escrow);
        }
        _;
    }

    /**
     * @dev Modifier to check if the contract has the admin key for the token
     */
    modifier hasContractAdminKey() {
        _checkHasContractAdminKey();
        _;
    }

    function _checkHasContractAdminKey() private {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory adminKey) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .getTokenKey(token, 0); // adminKey
        if (!_checkResponse(rc) || adminKey.contractId != address(this)) {
            revert TokenKeyMissing('Admin key');
        }
    }

    /**
     * @dev Modifier to check if the contract has the wipe key for the token
     */
    modifier hasContractWipeKey() {
        _checkHasContractWipeKey();
        _;
    }

    function _checkHasContractWipeKey() private {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory wipeKey) = IHederaTokenService(_PRECOMPILED_ADDRESS).getTokenKey(
            token,
            3
        ); // wipeKey
        if (!_checkResponse(rc) || wipeKey.contractId != address(this)) {
            revert TokenKeyMissing('Wipe key');
        }
    }

    /**
     * @dev Modifier to check if the contract has the supply key for the token
     */
    modifier hasContractSupplyKey() {
        _checkHasContractSupplyKey();
        _;
    }

    function _checkHasContractSupplyKey() private {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory supplyKey) = IHederaTokenService(_PRECOMPILED_ADDRESS)
            .getTokenKey(token, 4); // supplyKey
        if (!_checkResponse(rc) || supplyKey.contractId != address(this)) {
            revert TokenKeyMissing('Supply key');
        }
    }

    /**
     * @dev Modifier to check if the expiration timestamp is valid
     * @param expiration The expiration timestamp to validate
     */
    modifier validExpiration(uint256 expiration) {
        if (expiration <= block.timestamp) {
            revert InvalidExpiration(expiration, block.timestamp);
        }
        _;
    }

    /**
     * @notice Creates a hold on tokens owned by the caller
     * @dev The held amount is wiped from the caller's account and minted to this contract
     * @param _hold The hold parameters
     * @return success_ Whether the operation was successful
     * @return holdId_ The ID of the created hold
     */
    function createHold(
        Hold calldata _hold
    )
        external
        override
        hasContractAdminKey
        hasContractSupplyKey
        hasContractWipeKey
        validExpiration(_hold.expirationTimestamp)
        addressIsNotZero(_hold.escrow)
        addressIsNotZero(_hold.to)
        amountIsNotNegative(_hold.amount, false)
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _createHoldInternal(msg.sender, _hold, '');
    }

    /**
     * @notice Allows an authorized controller to create a hold on tokens owned by another account
     * @dev The controller must have the HOLD_CREATOR_ROLE
     * @param _from The address of the token holder
     * @param _hold The hold parameters
     * @param _operatorData Additional data provided by the operator
     * @return success_ Whether the operation was successful
     * @return holdId_ The ID of the created hold
     */
    function createHoldByController(
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        hasContractAdminKey
        hasContractSupplyKey
        hasContractWipeKey
        validExpiration(_hold.expirationTimestamp)
        addressIsNotZero(_hold.escrow)
        addressIsNotZero(_from)
        addressIsNotZero(_hold.to)
        onlyRole(_getRoleId(RoleName.HOLD_CREATOR_ROLE))
        amountIsNotNegative(_hold.amount, false)
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _createHoldInternal(_from, _hold, _operatorData);
    }

    /**
     * @dev Internal function to create a hold
     * @param _tokenHolder The address of the token holder
     * @param _hold The hold parameters
     * @param _operatorData Additional data provided by the operator
     * @return success_ Whether the operation was successful
     * @return holdId_ The ID of the created hold
     */
    function _createHoldInternal(
        address _tokenHolder,
        Hold calldata _hold,
        bytes memory _operatorData
    ) internal returns (bool success_, uint256 holdId_) {
        address currentTokenAddress = _getTokenAddress();
        HoldDataStorage storage holdDataStorage = _holdDataStorage();
        holdId_ = holdDataStorage.nextHoldIdByAccount[_tokenHolder];
        holdDataStorage.nextHoldIdByAccount[_tokenHolder]++;

        _wipeAndMintTokens(currentTokenAddress, _tokenHolder, _hold.amount);

        _registerHold(_tokenHolder, holdId_, _hold, _operatorData);

        emit HoldCreated(msg.sender, _tokenHolder, holdId_, _hold, _operatorData);
        return (true, holdId_);
    }

    /**
     * @notice Executes a hold, transferring tokens to the specified destination
     * @dev Can only be called by the authorized escrow
     * @param _holdIdentifier The identifier of the hold
     * @param _to The destination address for the tokens
     * @param _amount The amount of tokens to transfer
     * @return success_ Whether the operation was successful
     */
    function executeHold(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        int64 _amount
    )
        external
        validHold(_holdIdentifier)
        amountIsNotNegative(int256(_amount), false)
        validAmount(
            _holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(
            _holdDataStorage
            .holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp
        )
        isEscrow(_holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
        returns (bool success_)
    {
        HoldData storage holdData = _holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        if (holdData.to != address(0) && holdData.to != _to) {
            revert InvalidDestination(holdData.to, _to);
        }

        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount);

        if (!_transferTokens(address(this), _to, _amount)) {
            revert TransferFailed();
        }

        emit HoldExecuted(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount, _to);
        return true;
    }

    /**
     * @notice Releases tokens from a hold back to the token holder
     * @dev Can only be called by the authorized escrow
     * @param _holdIdentifier The identifier of the hold
     * @param _amount The amount of tokens to release
     * @return success_ Whether the operation was successful
     */
    function releaseHold(
        HoldIdentifier calldata _holdIdentifier,
        int64 _amount
    )
        external
        validHold(_holdIdentifier)
        validAmount(
            _holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(
            _holdDataStorage
            .holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp
        )
        isEscrow(_holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
        returns (bool success_)
    {
        address tokenHolder = msg.sender;

        _decreaseHoldAmount(tokenHolder, _holdIdentifier.holdId, _amount);

        if (!_transferTokens(address(this), _holdIdentifier.tokenHolder, _amount)) {
            revert TransferFailed();
        }

        emit HoldReleased(tokenHolder, _holdIdentifier.holdId, _amount);
        return true;
    }

    /**
     * @notice Reclaims tokens from an expired hold
     * @dev Can be called by anyone after the hold has expired
     * @param _holdIdentifier The identifier of the hold
     * @return success_ Whether the operation was successful
     */
    function reclaimHold(
        HoldIdentifier calldata _holdIdentifier
    ) external validHold(_holdIdentifier) returns (bool success_) {
        HoldData storage holdData = _holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        if (holdData.expirationTimestamp > block.timestamp) {
            revert HoldNotExpired(holdData.expirationTimestamp);
        }

        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, holdData.amount);

        if (!_transferTokens(address(this), _holdIdentifier.tokenHolder, holdData.amount)) {
            revert TransferFailed();
        }

        emit HoldReclaimed(msg.sender, _holdIdentifier.tokenHolder, holdData.id, holdData.amount);
        return true;
    }

    /**
     * @dev Wipes tokens from a holder's account and mints new tokens to this contract
     * @param tokenAddress The address of the token
     * @param tokenHolder The address of the token holder
     * @param amount The amount of tokens to wipe and mint
     * @return Whether the operation was successful
     */
    function _wipeAndMintTokens(address tokenAddress, address tokenHolder, int64 amount) internal returns (bool) {
        int64 mintedAmount = int64(uint64(amount));

        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).wipeTokenAccount(
            tokenAddress,
            tokenHolder,
            mintedAmount
        );

        if (!_checkResponse(responseCode)) revert WipeFailed();

        bytes[] memory metadata;

        (responseCode, , ) = IHederaTokenService(_PRECOMPILED_ADDRESS).mintToken(tokenAddress, mintedAmount, metadata);
        if (!_checkResponse(responseCode)) revert MintFailed();

        return true;
    }

    /**
     * @dev Transfers tokens from one address to another
     * @param from The source address
     * @param to The destination address
     * @param amount The amount of tokens to transfer
     * @return Whether the operation was successful
     */
    function _transferTokens(address from, address to, int64 amount) internal returns (bool) {
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            from,
            to,
            amount
        );
        return _checkResponse(responseCode);
    }

    /**
     * @dev Registers a new hold in the storage
     * @param tokenHolder The address of the token holder
     * @param holdId The ID of the hold
     * @param hold The hold parameters
     * @param operatorData Additional data provided by the operator
     */
    function _registerHold(
        address tokenHolder,
        uint256 holdId,
        Hold calldata hold,
        bytes memory operatorData
    ) internal {
        HoldDataStorage storage holdDataStorage = _holdDataStorage();
        holdDataStorage.holdsByAccountAndId[tokenHolder][holdId] = HoldData({
            id: holdId,
            amount: hold.amount,
            expirationTimestamp: hold.expirationTimestamp,
            escrow: hold.escrow,
            to: hold.to,
            data: hold.data,
            operatorData: operatorData
        });
        holdDataStorage.holdIdsByAccount[tokenHolder].add(holdId);
        holdDataStorage.totalHeldAmount += hold.amount;
        holdDataStorage.totalHeldAmountByAccount[tokenHolder] += hold.amount;
    }

    /**
     * @dev Decreases the amount of a hold
     * @param tokenHolder The address of the token holder
     * @param holdId The ID of the hold
     * @param amount The amount to decrease
     */
    function _decreaseHoldAmount(address tokenHolder, uint256 holdId, int64 amount) internal {
        HoldDataStorage storage holdDataStorage = _holdDataStorage();
        HoldData storage hold = holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];

        hold.amount -= amount;
        holdDataStorage.totalHeldAmount -= amount;
        holdDataStorage.totalHeldAmountByAccount[tokenHolder] -= amount;

        if (hold.amount == 0) {
            holdDataStorage.holdIdsByAccount[tokenHolder].remove(holdId);
            delete holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];
        }
    }

    /**
     * @notice Gets the total amount of tokens currently on hold
     * @return amount_ The total held amount
     */
    function getHeldAmount() external view returns (int64 amount_) {
        return _holdDataStorage().totalHeldAmount;
    }

    /**
     * @notice Gets the total amount of tokens on hold for a specific address
     * @param _tokenHolder The address of the token holder
     * @return amount_ The held amount for the specified address
     */
    function getHeldAmountFor(address _tokenHolder) external view returns (int64 amount_) {
        return _holdDataStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    /**
     * @notice Gets the number of holds for a specific address
     * @param _tokenHolder The address of the token holder
     * @return holdCount_ The number of holds
     */
    function getHoldCountFor(address _tokenHolder) external view returns (uint256 holdCount_) {
        return _holdDataStorage().holdIdsByAccount[_tokenHolder].length();
    }

    /**
     * @notice Gets the IDs of holds for a specific address with pagination
     * @param _tokenHolder The address of the token holder
     * @param _pageIndex The index of the page
     * @param _pageLength The length of the page
     * @return holdsId_ Array of hold IDs
     */
    function getHoldsIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory holdsId_) {
        EnumerableSet.UintSet storage holdsId = _holdDataStorage().holdIdsByAccount[_tokenHolder];
        uint256 length = holdsId.length();
        uint256 startIndex = _pageIndex * _pageLength;
        uint256 endIndex = (startIndex + _pageLength) > length ? length : (startIndex + _pageLength);

        holdsId_ = new uint256[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            holdsId_[i - startIndex] = holdsId.at(i);
        }

        return holdsId_;
    }

    /**
     * @notice Gets detailed information about a specific hold
     * @param _holdIdentifier The identifier of the hold
     * @return amount_ The amount of tokens on hold
     * @return expirationTimestamp_ The expiration timestamp of the hold
     * @return escrow_ The address of the escrow
     * @return destination_ The destination address for the tokens
     * @return data_ Additional data associated with the hold
     * @return operatorData_ Additional data provided by the operator
     */
    function getHoldFor(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        validHold(_holdIdentifier)
        returns (
            int64 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_
        )
    {
        HoldData storage holdData = _holdDataStorage().holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        return (
            holdData.amount,
            holdData.expirationTimestamp,
            holdData.escrow,
            holdData.to,
            holdData.data,
            holdData.operatorData
        );
    }
}
