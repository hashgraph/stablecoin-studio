# IBurnable









## Methods

### burn

```solidity
function burn(int64 amount) external nonpayable returns (bool)
```



*Burns an `amount` of tokens owned by the treasury account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int64 | The number of tokens to be burned |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TokensBurned

```solidity
event TokensBurned(address indexed burner, address indexed token, int64 amount)
```



*Emitted when the `amount` tokens are burned from TokenOwner*

#### Parameters

| Name | Type | Description |
|---|---|---|
| burner `indexed` | address | The caller of the function that emitted the event |
| token `indexed` | address | Token address |
| amount  | int64 | The number of tokens to burn |



