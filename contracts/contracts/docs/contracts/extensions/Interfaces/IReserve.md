# IReserve









## Methods

### getReserveAddress

```solidity
function getReserveAddress() external view returns (address)
```



*Gets the current reserve address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getReserveAmount

```solidity
function getReserveAmount() external view returns (int256)
```



*Get the current reserve amount*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | int256 | undefined |

### updateReserveAddress

```solidity
function updateReserveAddress(address newAddress) external nonpayable
```



*Changes the current reserve address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAddress | address | The new reserve address |



## Events

### ReserveAddressChanged

```solidity
event ReserveAddressChanged(address indexed previousAddress, address indexed newAddress)
```



*Emitted when the address for the reserve is changed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAddress `indexed` | address | The previous reserve address |
| newAddress `indexed` | address | The new reserve address |



## Errors

### AmountBiggerThanReserve

```solidity
error AmountBiggerThanReserve(uint256 amount)
```



*Emitted when the provided `amount` is bigger than the current reserve*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |

### FormatNumberIncorrect

```solidity
error FormatNumberIncorrect(uint256 amount)
```



*Emitted when the provided `amount` has an invalid format*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |


