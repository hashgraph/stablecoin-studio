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

    function createHold(Hold calldata _hold) external override returns (bool success_, uint256 holdId_) {
        address tokenHolder = msg.sender;
        address currentTokenAddress = _getTokenAddress();

        _requireValidHold(_hold);

        holdId_ = holdDataStorage.nextHoldIdByAccount[tokenHolder];
        holdDataStorage.nextHoldIdByAccount[tokenHolder]++;

        // Transfer tokens from holder to this contract
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            tokenHolder,
            address(this),
            int64(uint64(_hold.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        // Store the hold
        HoldData memory newHoldData = HoldData({
            id: holdId_,
            amount: _hold.amount,
            expirationTimestamp: _hold.expirationTimestamp,
            escrow: _hold.escrow,
            to: _hold.to,
            data: _hold.data,
            operatorData: ''
        });

        holdDataStorage.holdsByAccountAndId[tokenHolder][holdId_] = newHoldData;
        holdDataStorage.holdIdsByAccount[tokenHolder].add(holdId_);
        holdDataStorage.totalHeldAmount += _hold.amount;
        holdDataStorage.totalHeldAmountByAccount[tokenHolder] += _hold.amount;

        emit HoldCreated(msg.sender, tokenHolder, holdId_, _hold, '');

        return (true, holdId_);
    }

    function controllerCreateHold(
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    )
        external
        onlyRole(_getRoleId(RoleName.HOLD_CREATOR_ROLE))
        addressIsNotZero(_from)
        returns (bool success_, uint256 holdId_)
    {
        address currentTokenAddress = _getTokenAddress();

        _requireValidHold(_hold);

        holdId_ = holdDataStorage.nextHoldIdByAccount[_from];
        holdDataStorage.nextHoldIdByAccount[_from]++;

        // Transfer tokens from holder to this contract
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            _from,
            address(this),
            int64(uint64(_hold.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        HoldData memory newHoldData = HoldData({
            id: holdId_,
            amount: _hold.amount,
            expirationTimestamp: _hold.expirationTimestamp,
            escrow: _hold.escrow,
            to: _hold.to,
            data: _hold.data,
            operatorData: _operatorData
        });

        holdDataStorage.holdsByAccountAndId[_from][holdId_] = newHoldData;
        holdDataStorage.holdIdsByAccount[_from].add(holdId_);
        holdDataStorage.totalHeldAmount += _hold.amount;
        holdDataStorage.totalHeldAmountByAccount[_from] += _hold.amount;

        emit HoldCreated(msg.sender, _from, holdId_, _hold, _operatorData);
        return (true, holdId_);
    }

    function executeHold(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external override returns (bool success_) {
        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        require(_amount > 0, 'HoldManagement: INVALID_AMOUNT');
        require(holdData.amount >= _amount, 'HoldManagement: INSUFFICIENT_HOLD_AMOUNT');
        require(block.timestamp <= holdData.expirationTimestamp, 'HoldManagement: HOLD_EXPIRED');
        require(msg.sender == holdData.escrow, 'HoldManagement: ONLY_ESCROW_CAN_EXECUTE');

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

        // Update hold
        holdData.amount -= _amount;
        holdDataStorage.totalHeldAmount -= _amount;
        holdDataStorage.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;

        if (holdData.amount == 0) {
            holdDataStorage.holdIdsByAccount[_holdIdentifier.tokenHolder].remove(_holdIdentifier.holdId);
            delete holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId];
        }

        emit HoldExecuted(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount, _to);
        return true;
    }

    function releaseHold(HoldIdentifier calldata _holdIdentifier, uint256 _amount) external returns (bool success_) {
        address tokenHolder = msg.sender;

        HoldData storage holdData = holdDataStorage.holdsByAccountAndId[tokenHolder][_holdIdentifier.holdId];

        //Checks
        require(holdData.amount >= _amount, 'HoldManagement: INSUFFICIENT_AMOUNT');
        require(holdData.expirationTimestamp >= block.timestamp, 'HoldManagement: HOLD_EXPIRED');
        require(holdData.escrow == msg.sender, 'HoldManagement: ONLY_ESCROW_CAN_RELEASE');

        //Decrease hold amount
        holdData.amount -= _amount;
        holdDataStorage.totalHeldAmount -= _amount;
        holdDataStorage.totalHeldAmountByAccount[tokenHolder] -= _amount;

        //transfer to original token tokenHolder
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            address(this),
            tokenHolder,
            int64(uint64(_amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');

        //Remove hold
        holdDataStorage.holdIdsByAccount[tokenHolder].remove(_holdIdentifier.holdId);

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

        //Decrease hold amount
        holdDataStorage.totalHeldAmount -= holdData.amount;
        holdDataStorage.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= holdData.amount;

        //transfer to original token tokenHolder
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            address(this),
            _holdIdentifier.tokenHolder,
            int64(uint64(holdData.amount))
        );
        require(_checkResponse(responseCode), 'HoldManagement: TRANSFER_FAILED');
        //Remove hold
        holdDataStorage.holdIdsByAccount[_holdIdentifier.tokenHolder].remove(_holdIdentifier.holdId);

        //Emit event
        emit HoldReclaimed(msg.sender, _holdIdentifier.tokenHolder, holdData.id);
        return true;
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

    function _requireValidHold(Hold memory hold) internal view amountIsNotNegative(hold.amount, false){
        require(hold.expirationTimestamp > block.timestamp, 'HoldManagement: INVALID_EXPIRATION');
        require(hold.escrow != address(0), 'HoldManagement: INVALID_ESCROW');
    }
}
