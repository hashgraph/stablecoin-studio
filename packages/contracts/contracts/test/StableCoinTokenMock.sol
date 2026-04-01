// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity 0.8.24;

import {IERC20Metadata} from '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';
import {HederaResponseCodes} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol';
import {IHRC} from '../Interfaces/IHRC.sol';

contract StableCoinTokenMock is IERC20, IERC20Metadata, IHRC {
    error NotImplemented();

    uint256 private balance;
    mapping(address account => uint256 balance) private balances;
    uint256 private tokensTotalSupply;
    string private tokenName;
    string private tokenSymbol;
    int32 private tokenDecimals;
    address private stableCoinAddress;
    IHederaTokenService.TokenKey[] private tokenKeys;
    uint256 private anyAccountBalance;

    constructor(
        IHederaTokenService.HederaToken memory _token,
        int64 _initialTotalSupply,
        int32 _decimals,
        uint256 _anyAccountBalance
    ) {
        tokenName = _token.name;
        tokenSymbol = _token.symbol;
        balance = (uint256(uint64(_initialTotalSupply)));
        tokensTotalSupply = (uint256(uint64(_initialTotalSupply)));
        tokenDecimals = _decimals;
        for (uint256 i = 0; i < _token.tokenKeys.length; i++) {
            tokenKeys.push(_token.tokenKeys[i]);
        }
        anyAccountBalance = _anyAccountBalance;
    }

    function getKeys() external view returns (IHederaTokenService.TokenKey[] memory) {
        return tokenKeys;
    }

    function setStableCoinAddress(address _stableCoinAddress) external {
        stableCoinAddress = _stableCoinAddress;
        balances[stableCoinAddress] = tokensTotalSupply;
    }

    function allowance(address, address) external pure override returns (uint256) {
        revert NotImplemented();
    }

    function approve(address, uint256) external pure override returns (bool) {
        revert NotImplemented();
    }

    function balanceOf(address account) external view override returns (uint256) {
        return anyAccountBalance == 0 ? balances[account] : anyAccountBalance;
    }

    function totalSupply() external view override returns (uint256) {
        return tokensTotalSupply;
    }

    function transfer(address, uint256) external pure override returns (bool) {
        revert NotImplemented();
    }

    function transferFrom(address, address, uint256) external pure override returns (bool) {
        revert NotImplemented();
    }

    function name() external view override returns (string memory) {
        return tokenName;
    }

    function symbol() external view override returns (string memory) {
        return tokenSymbol;
    }

    function decimals() external view override returns (uint8) {
        return (uint8(uint32(tokenDecimals)));
    }

    function associate() external pure returns (int64 responseCode) {
        return HederaResponseCodes.SUCCESS;
    }

    function dissociate() external pure returns (int64 responseCode) {
        return HederaResponseCodes.SUCCESS;
    }

    function isAssociated() external pure returns (bool) {
        return true;
    }

    function increaseBalance(address account, uint256 amount) external {
        uint256 accountBalance = balances[account];
        balances[account] = accountBalance + amount;
    }

    function decreaseBalance(address account, uint256 amount) external {
        uint256 accountBalance = balances[account];
        balances[account] = accountBalance - amount;
    }

    function increaseTotalSupply(uint256 amount) external {
        tokensTotalSupply = tokensTotalSupply + amount;
        uint256 treasuryBalance = balances[stableCoinAddress];
        balances[stableCoinAddress] = treasuryBalance + amount;
    }

    function decreaseTotalSupply(uint256 amount) external {
        tokensTotalSupply = tokensTotalSupply - amount;
        uint256 treasuryBalance = balances[stableCoinAddress];
        balances[stableCoinAddress] = treasuryBalance - amount;
    }

    function getTokenKeys() external view returns (IHederaTokenService.TokenKey[] memory) {
        return tokenKeys;
    }
}
