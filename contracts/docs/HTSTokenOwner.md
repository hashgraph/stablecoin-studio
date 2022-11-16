# HTSTokenOwner









## Methods

### burnToken

```solidity
function burnToken(address tokenAddress, uint256 amount) external nonpayable returns (bool)
```



*Burns an `amount` of tokens owned by the treasury account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | The address of the token we want to burn |
| amount | uint256 | The number of tokens to be burned |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### delegateTransferFrom

```solidity
function delegateTransferFrom(address token, address from, address to, uint256 amount) external nonpayable returns (int64 responseCode)
```

Only applicable to fungible tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the fungible Hedera token to transfer |
| from | address | The account address of the owner of the token, on the behalf of which to transfer `amount` tokens |
| to | address | The account address of the receiver of the `amount` tokens |
| amount | uint256 | The amount of tokens to transfer from `from` to `to` |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### delegateTransferFromNFT

```solidity
function delegateTransferFromNFT(address token, address from, address to, uint256 serialNumber) external nonpayable returns (int64 responseCode)
```

Transfers `serialNumber` of `token` from `from` to `to` using the allowance mechanism. Only applicable to NFT tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the non-fungible Hedera token to transfer |
| from | address | The account address of the owner of `serialNumber` of `token` |
| to | address | The account address of the receiver of `serialNumber` |
| serialNumber | uint256 | The NFT serial number to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### erc20address

```solidity
function erc20address() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### freeze

```solidity
function freeze(address tokenAddress, address account) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

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

### pause

```solidity
function pause(address tokenAddress) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### remove

```solidity
function remove(address tokenAddress) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### setERC20Address

```solidity
function setERC20Address(address _erc20address) external nonpayable
```



*Sets the HederaERC20 contract address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _erc20address | address | The address of the HederaERC20 contract |

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

### transfer

```solidity
function transfer(address tokenAddress, address from, address to, uint256 amount) external nonpayable returns (bool)
```



*Transfer an amount of tokens from an account to another account    *

#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | The address of the token we want to transfer |
| from | address | The address of the account the tokens will be transferred to |
| to | address | undefined |
| amount | uint256 | The number of tokens to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | boolean True if successful        |

### transferFrom

```solidity
function transferFrom(address token, address from, address to, uint256 amount) external nonpayable returns (int64 responseCode)
```

Only applicable to fungible tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the fungible Hedera token to transfer |
| from | address | The account address of the owner of the token, on the behalf of which to transfer `amount` tokens |
| to | address | The account address of the receiver of the `amount` tokens |
| amount | uint256 | The amount of tokens to transfer from `from` to `to` |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### transferFromNFT

```solidity
function transferFromNFT(address token, address from, address to, uint256 serialNumber) external nonpayable returns (int64 responseCode)
```

Transfers `serialNumber` of `token` from `from` to `to` using the allowance mechanism. Only applicable to NFT tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the non-fungible Hedera token to transfer |
| from | address | The account address of the owner of `serialNumber` of `token` |
| to | address | The account address of the receiver of `serialNumber` |
| serialNumber | uint256 | The NFT serial number to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### unfreeze

```solidity
function unfreeze(address tokenAddress, address account) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### unpause

```solidity
function unpause(address tokenAddress) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

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




