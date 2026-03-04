# ICashIn









## Methods

### mint

```solidity
function mint(address account, int64 amount) external nonpayable returns (bool)
```



*Creates an `amount` of tokens and transfers them to an `account`, increasing the total supply*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address that receives minted tokens |
| amount | int64 | The number of tokens to be minted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TokensMinted

```solidity
event TokensMinted(address indexed minter, address indexed token, int64 amount, address indexed account)
```



*Emitted when the `amount` tokens have been minted to account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| minter `indexed` | address | The caller of the function that emitted the event |
| token `indexed` | address | Token address |
| amount  | int64 | The number of tokens to mint |
| account `indexed` | address | Account address |



