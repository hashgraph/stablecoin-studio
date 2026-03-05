# IWipeable









## Methods

### wipe

```solidity
function wipe(address account, int64 amount) external nonpayable returns (bool)
```



*Operation to wipe a token `amount` from `account` Validate that there is sufficient token balance before wipe*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account where to wipe the token |
| amount | int64 | The number of tokens to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TokensWiped

```solidity
event TokensWiped(address indexed wiper, address indexed token, address indexed account, int64 amount)
```



*Emitted when the `amount` tokens are wiped from `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| wiper `indexed` | address | undefined |
| token `indexed` | address | Token address |
| account `indexed` | address | The address of the account where to wipe the token |
| amount  | int64 | The number of tokens to wipe |



