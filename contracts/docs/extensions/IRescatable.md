# IRescatable









## Methods

### rescueHbar

```solidity
function rescueHbar(uint256 amount) external nonpayable
```



*Rescue `value` hbar from contractTokenOwner to rescuer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of hbar to rescuer |

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

### HbarRescued

```solidity
event HbarRescued(address rescuer, uint256 amount, uint256 oldAmount)
```



*Emitted when `value` habars are moved from contract account (`from`) to rescuer (`to`).     *

#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer  | address | The caller of the function that emitted the event |
| amount  | uint256 | The amount of the hbar that was rescued |
| oldAmount  | uint256 | The hbar balance before the rescue |

### TokenRescued

```solidity
event TokenRescued(address rescuer, address tokenId, uint256 amount, uint256 oldBalance)
```



*Emitted when `value` tokens are moved from contract account (`from`) to rescuer (`to`). Note that `value` may be zero.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer  | address | The caller of the function that emitted the event |
| tokenId  | address | The token that was rescued |
| amount  | uint256 | The amount of the token that was rescued |
| oldBalance  | uint256 | The contract&#39;s balance of the token before the rescue |



