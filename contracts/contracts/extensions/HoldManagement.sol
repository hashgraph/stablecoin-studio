// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {IHoldManagement} from './Interfaces/IHoldManagement.sol';
import {Roles} from './Roles.sol';
import {TokenOwner} from './TokenOwner.sol';

abstract contract HoldManagement is IHoldManagement, Roles, TokenOwner {
    using EnumerableSet for EnumerableSet.UintSet;

    error InsufficientHoldAmount(uint256 required, uint256 available);
    error InvalidExpiration(uint256 provided, uint256 current);
    error HoldNotFound(address tokenHolder, uint256 holdId);
    error UnauthorizedEscrow(address caller, address escrow);
    error HoldNotExpired(uint256 expirationTime);
    error InvalidDestination(address expected, address provided);
    error TransferFailed();
    error WipeFailed();
    error MintFailed();
    error TokenKeyMissing(string keyType);

    struct HoldDataStorage {
        uint256 totalHeldAmount;
        mapping(address => uint256) totalHeldAmountByAccount;
        mapping(address => mapping(uint256 => HoldData)) holdsByAccountAndId;
        mapping(address => EnumerableSet.UintSet) holdIdsByAccount;
        mapping(address => uint256) nextHoldIdByAccount;
    }

    HoldDataStorage private _holdDataStorage;

    modifier validExpiration(uint256 expiration) {
        if (expiration <= block.timestamp) {
            revert InvalidExpiration(expiration, block.timestamp);
        }
        _;
    }

    modifier validAmount(uint256 holdAmount, uint256 requestedAmount) {
        if (holdAmount < requestedAmount) {
            revert InsufficientHoldAmount(requestedAmount, holdAmount);
        }
        _;
    }

    modifier validHold(HoldIdentifier calldata _holdIdentifier) {
        if (!_holdDataStorage.holdIdsByAccount[_holdIdentifier.tokenHolder].contains(_holdIdentifier.holdId)) {
            revert HoldNotFound(_holdIdentifier.tokenHolder, _holdIdentifier.holdId);
        }
        _;
    }

    modifier nonExpired(uint256 expirationTimestamp) {
        if (expirationTimestamp < block.timestamp) {
            revert HoldNotExpired(expirationTimestamp);
        }
        _;
    }

    modifier isEscrow(address escrow) {
        if (escrow != msg.sender) {
            revert UnauthorizedEscrow(msg.sender, escrow);
        }
        _;
    }

    modifier hasContractAdminKey() {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory adminKey) = IHederaTokenService.getTokenKey(token, 0); // adminKey
        if (!_checkResponse(rc) || adminKey.contractId != address(this)) {
            revert TokenKeyMissing('Admin key');
        }
        _;
    }

    modifier hasContractWipeKey() {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory wipeKey) = IHederaTokenService.getTokenKey(token, 3); // wipeKey
        if (!_checkResponse(rc) || wipeKey.contractId != address(this)) {
            revert TokenKeyMissing('Wipe key');
        }
        _;
    }

    modifier hasContractSupplyKey() {
        address token = _getTokenAddress();
        (int64 rc, IHederaTokenService.KeyValue memory supplyKey) = IHederaTokenService.getTokenKey(token, 4); // supplyKey
        if (!_checkResponse(rc) || supplyKey.contractId != address(this)) {
            revert TokenKeyMissing('Supply key');
        }
        _;
    }

    function createHold(
        Hold calldata _hold
    )
        external
        override
        hasContractAdminKey
        hasContractSupplyKey
        hasContractWipeKey
        returns (bool success_, uint256 holdId_)
    {
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
        holdId_ = _holdDataStorage.nextHoldIdByAccount[_tokenHolder];
        _holdDataStorage.nextHoldIdByAccount[_tokenHolder]++;

        _wipeAndMintTokens(currentTokenAddress, _tokenHolder, _hold.amount);

        _registerHold(_tokenHolder, holdId_, _hold, _operatorData);

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
        validHold(_holdIdentifier)
        amountIsNotNegative(_amount, false)
        validAmount(
            _holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(
            _holdDataStorage
            .holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp
        )
        isEscrow(_holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
        returns (bool success_)
    {
        HoldData storage holdData = _holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        if (holdData.to != address(0) && holdData.to != _to) {
            revert InvalidDestination(holdData.to, _to);
        }

        if (!_transferTokens(address(this), _to, _amount)) {
            revert TransferFailed();
        }

        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount);

        emit HoldExecuted(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, _amount, _to);
        return true;
    }

    function releaseHold(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    )
        external
        validHold(_holdIdentifier)
        validAmount(
            _holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].amount,
            _amount
        )
        nonExpired(
            _holdDataStorage
            .holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].expirationTimestamp
        )
        isEscrow(_holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][_holdIdentifier.holdId].escrow)
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

    function reclaimHold(
        HoldIdentifier calldata _holdIdentifier
    ) external validHold(_holdIdentifier) returns (bool success_) {
        HoldData storage holdData = _holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.holdId
        ];

        if (holdData.expirationTimestamp > block.timestamp) {
            revert HoldNotExpired(holdData.expirationTimestamp);
        }

        uint256 amount = holdData.amount;
        _decreaseHoldAmount(_holdIdentifier.tokenHolder, _holdIdentifier.holdId, amount);

        if (!_transferTokens(address(this), _holdIdentifier.tokenHolder, amount)) {
            revert TransferFailed();
        }

        emit HoldReclaimed(msg.sender, _holdIdentifier.tokenHolder, holdData.id);
        return true;
    }

    function _wipeAndMintTokens(address tokenAddress, address tokenHolder, uint256 amount) internal returns (bool) {
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).wipeTokenAccount(
            tokenAddress,
            tokenHolder,
            int64(uint64(amount))
        );
        if (!_checkResponse(responseCode)) revert WipeFailed();

        responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).mintToken(tokenAddress, int64(uint64(amount)));
        if (!_checkResponse(responseCode)) revert MintFailed();

        return true;
    }

    function _transferTokens(address from, address to, uint256 amount) internal returns (bool) {
        address currentTokenAddress = _getTokenAddress();
        int64 responseCode = IHederaTokenService(_PRECOMPILED_ADDRESS).transferToken(
            currentTokenAddress,
            from,
            to,
            int64(uint64(amount))
        );
        return _checkResponse(responseCode);
    }

    function _registerHold(
        address tokenHolder,
        uint256 holdId,
        Hold calldata hold,
        bytes memory operatorData
    ) internal {
        HoldData memory newHoldData = HoldData({
            id: holdId,
            amount: hold.amount,
            expirationTimestamp: hold.expirationTimestamp,
            escrow: hold.escrow,
            to: hold.to,
            data: hold.data,
            operatorData: operatorData
        });

        _holdDataStorage.holdsByAccountAndId[tokenHolder][holdId] = newHoldData;
        _holdDataStorage.holdIdsByAccount[tokenHolder].add(holdId);
        _holdDataStorage.totalHeldAmount += hold.amount;
        _holdDataStorage.totalHeldAmountByAccount[tokenHolder] += hold.amount;
    }

    function _decreaseHoldAmount(address tokenHolder, uint256 holdId, uint256 amount) internal {
        HoldData storage hold = _holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];

        hold.amount -= amount;
        _holdDataStorage.totalHeldAmount -= amount;
        _holdDataStorage.totalHeldAmountByAccount[tokenHolder] -= amount;

        if (hold.amount == 0) {
            _holdDataStorage.holdIdsByAccount[tokenHolder].remove(holdId);
            delete _holdDataStorage.holdsByAccountAndId[tokenHolder][holdId];
        }
    }

    function getHeldAmount() external view returns (uint256 amount_) {
        return _holdDataStorage.totalHeldAmount;
    }

    function getHeldAmountFor(address _tokenHolder) external view returns (uint256 amount_) {
        return _holdDataStorage.totalHeldAmountByAccount[_tokenHolder];
    }

    function getHoldCountFor(address _tokenHolder) external view returns (uint256 holdCount_) {
        return _holdDataStorage.holdIdsByAccount[_tokenHolder].length();
    }

    function getHoldsIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory holdsId_) {
        EnumerableSet.UintSet storage holdsId = _holdDataStorage.holdIdsByAccount[_tokenHolder];
        uint256 length = holdsId.length();
        uint256 startIndex = _pageIndex * _pageLength;
        uint256 endIndex = (startIndex + _pageLength) > length ? length : (startIndex + _pageLength);

        holdsId_ = new uint256[](endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            holdsId_[i - startIndex] = holdsId.at(i);
        }

        return holdsId_;
    }

    function getHoldFor(
        HoldIdentifier calldata _holdIdentifier
    )
        external
        view
        validHold(_holdIdentifier)
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_
        )
    {
        HoldData storage holdData = _holdDataStorage.holdsByAccountAndId[_holdIdentifier.tokenHolder][
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
