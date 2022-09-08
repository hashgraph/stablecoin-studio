# IHTSTokenOwner









## Methods

### mintToken

```solidity
function mintToken(address tokenAddress, uint256 amount) external nonpayable returns (bool)
```



*Creates an `amount` of tokens and transfers them to an `account`, increasing the total supply*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | The address of the token we want to mint |
| amount | uint256 | The number of tokens to be minted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### tranferContract

```solidity
function tranferContract(address tokenAddress, address to, uint256 amount) external nonpayable returns (bool)
```



*Transfers an amount of token from the token owner contract to an account    *

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | The address of the token we want to transfer |
| to | address | The address of the account the tokens will be transferred |
| amount | uint256 | The number of tokens to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | boolean True if successful        |

### wipeToken

```solidity
function wipeToken(address tokenAddress, address account, uint32 amount) external nonpayable returns (bool)
```



*Wipes an amount of tokens from an account    *

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | The address of the token we want to wipe |
| account | address | The address of the where tokens will be wiped |
| amount | uint32 | The number of tokens to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | boolean True if successful        |




