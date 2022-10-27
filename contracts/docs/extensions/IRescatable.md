# IRescatable









## Methods

### rescueToken

```solidity
function rescueToken(uint256 amount) external nonpayable
```



*Rescue `value` tokens from contractTokenOwner to rescuer *

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of tokens to rescuer |



## Events

### TokenRescued

```solidity
event TokenRescued(address rescuer, address tokenId, uint256 amount)
```



*Emitted when `value` tokens are moved from contract account (`from`) to rescuer (`to`). Note that `value` may be zero.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer  | address | The caller of the function that emitted the event |
| tokenId  | address | The token that was rescued |
| amount  | uint256 | The amount of the token that was rescued |



