# IReserve









## Methods

### getDataFeed

```solidity
function getDataFeed() external view returns (address)
```



*Get the current amount of reserve*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getReserve

```solidity
function getReserve() external view returns (int256)
```



*Get the current amount of reserve*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | int256 | undefined |

### updateDataFeed

```solidity
function updateDataFeed(address newAddress) external nonpayable
```



*Changes the current reserve*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAddress | address | The new reserve address |



## Events

### ReserveAddressChanged

```solidity
event ReserveAddressChanged(address previousAddress, address newAddress)
```



*Emitted when the address for the reserve is changed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAddress  | address | The previous reserve address |
| newAddress  | address | The new reserve address |



