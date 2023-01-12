# IHederaERC20









## Methods

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```



*Returns the number tokens that an account has*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account to be consulted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The number number tokens that an account has |

### decimals

```solidity
function decimals() external view returns (uint8)
```



*Returns the number of decimals of the token*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | uint8 The number of decimals of the token |

### name

```solidity
function name() external view returns (string)
```



*Returns the name of the token*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The the name of the token |

### symbol

```solidity
function symbol() external view returns (string)
```



*Returns the symbol of the token*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The the symbol of the token |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the total number of tokens that exits*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The total number of tokens that exists |



## Events

### TokenAssociated

```solidity
event TokenAssociated(address token, address account)
```



*Emitted when the token has been associated to the account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | Token address |
| account  | address | Account address |

### TokenDissociated

```solidity
event TokenDissociated(address token, address account)
```



*Emitted when the token has been dissociated from the account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | Token address |
| account  | address | Account address |

### TokenTransfer

```solidity
event TokenTransfer(address token, address sender, address receiver, uint256 amount)
```



*Emitted when tokens have been transfered from sender to receiver*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | Token address |
| sender  | address | Sender address |
| receiver  | address | Receiver address |
| amount  | uint256 | Transfered amount |



