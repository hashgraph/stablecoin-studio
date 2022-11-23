# HederaTokenService









## Methods

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




