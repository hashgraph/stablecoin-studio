// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {IERC20Upgradeable} from '@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import {ContextUpgradeable} from '@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol';
import {Initializable} from '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import {IHederaTokenService} from '@hashgraph/smart-contracts/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol';

struct MockedToken {
    int64 totalSupply;
    int32 decimals;
}

// ! NOT WORKING, Have to rethink if makes sense to have this for Hardhat tests
/* solhint-disable */
contract MockHtsBurn is Initializable, ContextUpgradeable, IERC20Upgradeable {
    mapping(address => MockedToken) private _tokens;
    mapping(address => bool) private _isAssociated;
    mapping(address => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    function initialize() public initializer {
        __Context_init();
    }

    function associateToken(address account, address token) external returns (int64 responseCode) {
        _isAssociated[account] = true;
        return 22; // SUCCESS
    }

    function createFungibleToken(
        IHederaTokenService.HederaToken memory token,
        int64 initialTotalSupply,
        int32 decimals
    ) external payable returns (int64 responseCode, address tokenAddress) {
        _tokens[tokenAddress] = MockedToken({totalSupply: initialTotalSupply, decimals: decimals});
        return (22, address(0x6666666666666666666666666666666666666666)); // SUCCESS
    }

    function totalSupply() external view override returns (uint256) {
        return uint256(int256(_tokens[address(this)].totalSupply));
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balances[address(this)][account];
    }

    function transfer(address to, uint256 amount) external override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }

    function burn(address account, uint256 amount) external {
        require(_balances[address(this)][account] >= amount, 'ERC20: burn amount exceeds balance');
        _balances[address(this)][account] -= amount;
        emit Transfer(account, address(0), amount);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        address owner = _msgSender();
        _approve(owner, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), 'ERC20: transfer from the zero address');
        require(to != address(0), 'ERC20: transfer to the zero address');

        uint256 fromBalance = _balances[address(this)][from];
        require(fromBalance >= amount, 'ERC20: transfer amount exceeds balance');
        _balances[address(this)][from] = fromBalance - amount;
        _balances[address(this)][to] += amount;

        emit Transfer(from, to, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), 'ERC20: approve from the zero address');
        require(spender != address(0), 'ERC20: approve to the zero address');

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = _allowances[owner][spender];
        require(currentAllowance >= amount, 'ERC20: insufficient allowance');
        _approve(owner, spender, currentAllowance - amount);
    }
}
/* solhint-enable */
/* solhint-enable */
