# IMintable









## Methods

### mint

```solidity
function mint(address account, uint256 amount) external nonpayable
```



*Creates an `amount` of tokens and transfers them to an `account`, increasing the total supply*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address that receives minted tokens |
| amount | uint256 | The number of tokens to be minted |



## Events

### TokensMinted

```solidity
event TokensMinted(address minter, address token, uint256 amount, address account)
```



*Emitted when the `amount` tokens have been minted to account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| minter  | address | The caller of the function that emitted the event |
| token  | address | Token address |
| amount  | uint256 | The number of tokens to mint |
| account  | address | Account address |



