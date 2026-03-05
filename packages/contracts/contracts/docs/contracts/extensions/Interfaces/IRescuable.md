# IRescuable









## Methods

### rescue

```solidity
function rescue(int64 amount) external nonpayable returns (bool)
```



*Rescues `value` tokens from contractTokenOwner to rescuer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int64 | The number of tokens to rescuer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### rescueHBAR

```solidity
function rescueHBAR(uint256 amount) external nonpayable returns (bool)
```



*Rescues `value` HBAR from contractTokenOwner to rescuer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of tokens to rescuer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### HBARRescued

```solidity
event HBARRescued(address indexed rescuer, uint256 amount)
```



*Emitted when `value` HBARs are moved from contract account (`from`) to rescuer (`to`). Note that `value` may be zero.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer `indexed` | address | The caller of the function that emitted the event |
| amount  | uint256 | The amount of the token that was rescued |

### TokenRescued

```solidity
event TokenRescued(address indexed rescuer, address indexed tokenId, int64 amount)
```



*Emitted when `value` tokens are moved from contract account (`from`) to rescuer (`to`). Note that `value` may be zero.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer `indexed` | address | The caller of the function that emitted the event |
| tokenId `indexed` | address | The token that was rescued |
| amount  | int64 | The amount of the token that was rescued |



## Errors

### HBARRescueError

```solidity
error HBARRescueError(uint256 amount)
```



*Emitted when rescuing HBAR did not work*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of HBAR to rescue |


