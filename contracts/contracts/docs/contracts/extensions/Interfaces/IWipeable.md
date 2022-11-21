# IWipeable









## Methods

### wipe

```solidity
function wipe(address account, uint32 amount) external nonpayable
```



*Operation to wipe a token `amount` from `account` Validate that there is sufficient token balance before wipe *

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account where to wipe the token |
| amount | uint32 | The number of tokens to wipe |



## Events

### TokensWiped

```solidity
event TokensWiped(address wiper, address token, address account, uint32 amount)
```



*Emitted when the `amount` tokens are wiped from `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| wiper  | address | undefined |
| token  | address | Token address |
| account  | address | The address of the account where to wipe the token |
| amount  | uint32 | The number of tokens to wipe |



