// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import {Roles} from './Roles.sol';
import {TokenOwner} from './TokenOwner.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';

abstract contract HoldManagement is IHoldManagement, Roles, TokenOwner {
    using EnumerableSet for EnumerableSet.UintSet;

    struct HoldDataStorage {
        uint256 totalHeldAmount;
        mapping(address => uint256) totalHeldAmountByAccount;
        mapping(address => mapping(uint256 => HoldData)) holdsByAccountAndId;
        mapping(address => EnumerableSet.UintSet) holdIdsByAccount;
        mapping(address => uint256) nextHoldIdByAccount;
    }

    HoldDataStorage private holdDataStorage;

    modifier validExpiration(uint256 expiration) {
        require(expiration > block.timestamp, 'HoldManagement: INVALID_EXPIRATION');
        _;
    }

    modifier validAmount(uint256 holdAmount, uint256 requestedAmount) {
        require(holdAmount >= requestedAmount, 'HoldManagement: INSUFFICIENT_HOLD_AMOUNT');
        _;
    }

    modifier nonExpired(uint256 expirationTimestamp) {
        require(expirationTimestamp >= block.timestamp, 'HoldManagement: HOLD_EXPIRED');
        _;
    }

    modifier isEscrow(address escrow) {
        require(escrow == msg.sender, 'HoldManagement: INVALID_ESCROW');
        _;
    }


    function createHold(Hold calldata _hold) external override returns (bool success_, uint256 holdId_) {
        address tokenHolder = msg.sender;
        (success_, holdId_) = _createHoldInternal(tokenHolder, _hold, '');
    }

    function createHoldByController(
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        onlyRole(_getRoleId(RoleName.HOLD_CREATOR_ROLE))
        addressIsNotZero(_from)
        returns (bool success_, uint256 holdId_)
    {
        (success_, holdId_) = _createHoldInternal(_from, _hold, _operatorData);
    }

    function _createHoldInternal(
        address _tokenHolder,
        Hold calldata _hold,
        bytes memory _operatorData
    )
        internal
        validExpiration(_hold.expirationTimestamp)
        addressIsNotZero(_hold.escrow)
        amountIsNotNegative(_hold.amount)
        returns (bool success_, uint256 holdId_)
    {
        address currentTokenAddress = _getTokenAddress();

        holdId_ = holdDataStorage.nextHoldIdByAccount[_tokenHolder];
        holdDataStorage.nextHoldIdByAccount[_tokenHolder]++;

        // Wipe tokens from holder
        int responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).wipeTokenAccount(
            currentTokenAddress,
            _tokenHolder,
            int64(uint64(_hold.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: WIPE_FAILED');

        // Mint tokens to this contract
        responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).mintToken(
            currentTokenAddress,
            int64(uint64(_hold.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: MINT_FAILED');

        // Register hold
        HoldData memory newHoldData = HoldData({
            id: holdId_,
            amount: _hold.amount,
            expirationTimestamp: _hold.expirationTimestamp,
            escrow: _hold.escrow,
            to: _hold.to,
            data: _hold.data,
            operatorData: _operatorData
        });

        holdDataStorage.holdsByAccountAndId[_tokenHolder][holdId_] = newHoldData;
        holdDataStorage.holdIdsByAccount[_tokenHolder].add(holdId_);
        holdDataStorage.totalHeldAmount += _hold.amount;
        holdDataStorage.totalHeldAmountByAccount[_tokenHolder] += _hold.amount;

        emit HoldCreated(msg.sender, _tokenHolder, holdId_, _hold, _operatorData);

        return (true, holdId_);
    }

    function executeHold(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    )
        external
        override
        amountIsNotNegative(_amount, false)
        validAmount(
            holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp)
        isEscrow(holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
        returns (bool success_)
    {
        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        if (holdData.to != address(0)) {
            require(holdData.to == _to, 'HoldManagement: INVALID_DESTINATION');
        }

        address currentTokenAddress = _getTokenAddress();

        // Transfer tokens from contract to recipient
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            address(this),
            _to,
            int64(uint64(_amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount);

        emit HoldExecuted(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount, _to);
        return true;
    }

    function releaseHold(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    )
        external
        validAmount(
            holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp)
        isEscrow(holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
        returns (bool success_)
    {
        address tokenHolder = msg.sender;

        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[tokenHolder][_holdIdentifier.holdId];

        _decreaseHoldAmount(tokenHolder, _holdIdentifier.holdId, _amount);

        //transfer to original tokenHolder
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            address(this),
            tokenHolder,
            int64(uint64(_amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        //Emit event
        emit HoldReleased(tokenHolder, _holdIdentifier.holdId, _amount, address(0));
        return true;
    }

    function getHeldAmount() external view returns (uint256 amount_) {
        return holdDataStorage.totalHeldAmount;
    }

    function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_) {
        return holdDataStorage.totalHeldAmountByAccount[_tokenHolder];
    }

    function getHoldCountFor(address _tokenHolder) external view returns (uint256 holdCount_) {
        return holdDataStorage.holdIdsByAccount[_tokenHolder].length();
    }

    function getHoldsIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory holdsId_) {
        EnumerableSet.UintSet storage holdsId = holdDataStorage.holdIdsByAccount[_tokenHolder];

        uint256 length = holdsId.length();
        uint256 startIndex = _pageIndex * _pageLength;
        uint256 endIndex = (startIndex + _pageLength) > length ? length : (startIndex + _pageLength);

        holdsId_ = new uint256[](endIndex - startIndex);

        for (uint256 i = startIndex; i < endIndex; i++) {
            holdsId_[i - startIndex] = holdsId.at(i);
        }

        return holdsId_;
    }

    function reclaimHold(HoldIdentifier calldata _holdIdentifier) external returns (bool success_) {
        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        require(holdData.expirationTimestamp <= block.timestamp, 'HoldManagement: HOLD_NOT_EXPIRED');

        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, holdData.amount);

        //transfer to original tokenHolder
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            address(this),
            _holdIdentifier.tokenHolder,
            int64(uint64(holdData.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        //Emit event
        emit HoldReclaimed(msg.sender, _holdIdentifier.tokenHolder, holdData.id);
        return true;
    }

    function _decreaseHoldAmount(address tokenHolder, uint256 holdId, uint256 amount) internal {
        HoldData storage hold = holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];

        hold.amount -= amount;
        holdDataStorage.totalHeldAmount -= amount;
        holdDataStorage.totalHeldAmountByAccount[tokenHolder] -= amount;

        if (hold.amount == 0) {
            holdDataStorage.holdIdsByAccount[tokenHolder].remove(holdId);
            delete holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];
        }
    }


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
        )
    {
        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
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
