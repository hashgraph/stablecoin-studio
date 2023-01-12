# HederaReserve









## Methods

### decimals

```solidity
function decimals() external pure returns (uint8)
```



*Decimals of the reserve*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | The decimals |

### description

```solidity
function description() external pure returns (string)
```



*Description of the reserve*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | The description |

### getRoundData

```solidity
function getRoundData(uint80) external pure returns (uint80, int256, uint256, uint256, uint80)
```



*Gets a value from a specific round*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint80 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint80 | undefined |
| _1 | int256 | undefined |
| _2 | uint256 | undefined |
| _3 | uint256 | undefined |
| _4 | uint80 | undefined |

### initialize

```solidity
function initialize(int256 initialReserve, address admin) external nonpayable
```



*Initializes the reserve with the initial amount*

#### Parameters

| Name | Type | Description |
|---|---|---|
| initialReserve | int256 | The initial amount to be on the reserve |
| admin | address | undefined |

### latestRoundData

```solidity
function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
```



*Returns the latest round data*


#### Returns

| Name | Type | Description |
|---|---|---|
| roundId | uint80 | undefined |
| answer | int256 | undefined |
| startedAt | uint256 | undefined |
| updatedAt | uint256 | undefined |
| answeredInRound | uint80 | undefined |

### set

```solidity
function set(int256 newValue) external nonpayable
```



*Sets a new reserve amount*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newValue | int256 | The new value of the reserve |

### setAdmin

```solidity
function setAdmin(address admin) external nonpayable
```



*Sets a new admin address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| admin | address | The new admin |

### version

```solidity
function version() external pure returns (uint256)
```



*Version of the reserve*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The current version |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### ReserveInitialized

```solidity
event ReserveInitialized(int256 initialReserve)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| initialReserve  | int256 | undefined |



