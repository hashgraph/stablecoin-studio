# IHederaTokenManager









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

### getMetadata

```solidity
function getMetadata() external view returns (string)
```



*Gets the metadata*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

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

### updateToken

```solidity
function updateToken(IHederaTokenManager.UpdateTokenStruct updatedToken) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| updatedToken | IHederaTokenManager.UpdateTokenStruct | undefined |



## Events

### MetadataSet

```solidity
event MetadataSet(address indexed admin, string metadata)
```



*Emitted when a new metadata was set*

#### Parameters

| Name | Type | Description |
|---|---|---|
| admin `indexed` | address | The account that set the metadata |
| metadata  | string | The metadata that was set |

### TokenTransfer

```solidity
event TokenTransfer(address indexed token, address indexed sender, address indexed receiver, int64 amount)
```



*Emitted when tokens have been transfered from sender to receiver*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |
| sender `indexed` | address | Sender address |
| receiver `indexed` | address | Receiver address |
| amount  | int64 | Transfered amount |

### TokenUpdated

```solidity
event TokenUpdated(address indexed token, IHederaTokenManager.UpdateTokenStruct updateTokenStruct, address newTreasury)
```



*Emitted when token updated*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |
| updateTokenStruct  | IHederaTokenManager.UpdateTokenStruct | Struct containing updated token data |
| newTreasury  | address | Token treasury account |



## Errors

### MoreThan100Error

```solidity
error MoreThan100Error(string s)
```



*Emitted when the provided `s` is less than 100 characters long*

#### Parameters

| Name | Type | Description |
|---|---|---|
| s | string | The string to check |

### RefundingError

```solidity
error RefundingError(uint256 amount)
```



*Emitted when transfering funds back to original sender after creating the token did not work*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |


