# IPausable









## Methods

### pause

```solidity
function pause() external nonpayable returns (bool)
```



*Pauses the token in order to prevent it from being involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### unpause

```solidity
function unpause() external nonpayable returns (bool)
```



*Unpauses the token in order to allow it to be involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TokenPaused

```solidity
event TokenPaused(address indexed token)
```



*Emitted when the token is paused*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |

### TokenUnpaused

```solidity
event TokenUnpaused(address indexed token)
```



*Emitted when the token is unpaused*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |



