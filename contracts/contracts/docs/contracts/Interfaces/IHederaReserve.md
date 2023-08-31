# IHederaReserve









## Methods

### decimals

```solidity
function decimals() external view returns (uint8)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | undefined |

### description

```solidity
function description() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getRoundData

```solidity
function getRoundData(uint80 _roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _roundId | uint80 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| roundId | uint80 | undefined |
| answer | int256 | undefined |
| startedAt | uint256 | undefined |
| updatedAt | uint256 | undefined |
| answeredInRound | uint80 | undefined |

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| roundId | uint80 | undefined |
| answer | int256 | undefined |
| startedAt | uint256 | undefined |
| updatedAt | uint256 | undefined |
| answeredInRound | uint80 | undefined |

### setAdmin

```solidity
function setAdmin(address admin) external nonpayable
```



*Sets a new admin address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| admin | address | The new admin |

### setAmount

```solidity
function setAmount(int256 newValue) external nonpayable
```



*Sets a new reserve amount*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newValue | int256 | The new value of the reserve |

### version

```solidity
function version() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |



## Events

### AdminChanged

```solidity
event AdminChanged(address indexed previousAdmin, address indexed newAdmin)
```



*Emitted when HederaReserve contract admin has changed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin `indexed` | address | The previous admin |
| newAdmin `indexed` | address | The new admin |

### AmountChanged

```solidity
event AmountChanged(int256 previousAmount, int256 newAmount)
```



*Emitted when the reserve amount has changed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAmount  | int256 | The previous amount |
| newAmount  | int256 | The new amount |

### ReserveInitialized

```solidity
event ReserveInitialized(int256 initialReserve)
```



*Emitted when a new reserve is initialized*

#### Parameters

| Name | Type | Description |
|---|---|---|
| initialReserve  | int256 | The initial reserve |



## Errors

### AddressZero

```solidity
error AddressZero(address addr)
```



*Emitted when the provided `addr` is 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The address to check |


