// SPDX-License-Identifier: Apache-2.0
// solhint-disable one-contract-per-file
pragma solidity 0.8.18;

import {
    IERC20MetadataUpgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol';
import {
    IERC20Upgradeable
} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {
    IHederaTokenService
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol";
import {
    HederaResponseCodes
} from "@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/HederaTokenService.sol";
import { IHRC } from '../Interfaces/IHRC.sol';


contract StableCoinTokenMock is IERC20Upgradeable, IERC20MetadataUpgradeable, IHRC {
    error NotImplemented();

    uint256 private balance = 0;
    string private tokenName;
    string private tokenSymbol;
    int64 private tokenInitialTotalSupply;
    int32 private tokenDecimals;

    constructor(
        IHederaTokenService.HederaToken memory _token,
        int64 _initialTotalSupply,
        int32 _decimals
    ) {
        tokenName = _token.name;
        tokenSymbol = _token.symbol;
        tokenInitialTotalSupply = _initialTotalSupply;
        tokenDecimals = _decimals;
    }

    function allowance(address, address) external pure override returns (uint256) {
        revert NotImplemented();
    }

    function approve(address, uint256) external pure override returns (bool) {
        revert NotImplemented();
    }

    function balanceOf(address) external view override returns (uint256) {
        return balance;
    }

    function totalSupply() external pure override returns (uint256) {
        return 1;
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

    function decimals() external pure override returns (uint8) {
        return 3;
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

    function increaseBalance(uint256 amount) external {
        balance = balance + amount;
    }
}
