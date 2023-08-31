# ITokenOwner









## Methods

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```



*Returns the token address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address The token address |




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

### GreaterThan

```solidity
error GreaterThan(uint256 value, uint256 ref)
```



*Emitted when the provided `value` is not greater than `ref`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| value | uint256 | The value to check |
| ref | uint256 | The reference value |

### LessThan

```solidity
error LessThan(uint256 value, uint256 ref)
```



*Emitted when the provided `value` is not less than `ref`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| value | uint256 | The value to check |
| ref | uint256 | The reference value |

### NegativeAmount

```solidity
error NegativeAmount(int256 amount)
```



*Emitted when the provided `amount` is less than 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int256 | The value to check |

### ResponseCodeInvalid

```solidity
error ResponseCodeInvalid(int256 code)
```



*Emitted when the provided `code` is not success*

#### Parameters

| Name | Type | Description |
|---|---|---|
| code | int256 | The code to check |


