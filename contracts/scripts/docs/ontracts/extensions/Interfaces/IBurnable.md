# IBurnable









## Methods

### burn

```solidity
function burn(uint256 amount) external nonpayable returns (bool)
```



*Burns an `amount` of tokens owned by the treasury account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of tokens to be burned |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TokensBurned

```solidity
event TokensBurned(address burner, address token, uint256 amount)
```



*Emitted when the `amount` tokens are burned from TokenOwner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| burner  | address | The caller of the function that emitted the event |
| token  | address | Token address |
| amount  | uint256 | The number of tokens to burn |



