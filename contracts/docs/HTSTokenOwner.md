# HTSTokenOwner









## Methods

### burnToken

```solidity
function burnToken(address tokenAddress, uint256 amount) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### erc20address

```solidity
function erc20address() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getTokenExpiryInfo

```solidity
function getTokenExpiryInfo(address token) external nonpayable returns (int256 responseCode, struct IHederaTokenService.Expiry expiryInfo)
```

Operation to get token expiry info



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int256 | The response code for the status of the request. SUCCESS is 22. |
| expiryInfo | IHederaTokenService.Expiry | The expiry info of the token |

### getTokenKey

```solidity
function getTokenKey(address token, uint256 keyType) external nonpayable returns (int64 responseCode, struct IHederaTokenService.KeyValue key)
```

Query token KeyValue



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| keyType | uint256 | The keyType of the desired KeyValue |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| key | IHederaTokenService.KeyValue | KeyValue info for key of type `keyType` |

### grantTokenKyc

```solidity
function grantTokenKyc(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to grant kyc to token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to grant kyc |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### isKyc

```solidity
function isKyc(address token, address account) external nonpayable returns (int64 responseCode, bool kycGranted)
```

Query if token account has kyc granted



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| account | address | The account address associated with the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| kycGranted | bool | True if `account` has kyc granted for `token` |

### mintToken

```solidity
function mintToken(address tokenAddress, uint256 amount) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### pauseToken

```solidity
function pauseToken(address token) external nonpayable returns (int256 responseCode)
```

Operation to pause token



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to be paused |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int256 | The response code for the status of the request. SUCCESS is 22. |

### revokeTokenKyc

```solidity
function revokeTokenKyc(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to revoke kyc to token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to revoke kyc |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### setERC20Address

```solidity
function setERC20Address(address _erc20address) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _erc20address | address | undefined |

### toString

```solidity
function toString(bytes data) external pure returns (string)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| data | bytes | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### tranferContract

```solidity
function tranferContract(address tokenAddress, address to, uint256 amount) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| to | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transfer

```solidity
function transfer(address tokenAddress, address from, address to, uint256 amount) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| from | address | undefined |
| to | address | undefined |
| amount | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### unpauseToken

```solidity
function unpauseToken(address token) external nonpayable returns (int256 responseCode)
```

Operation to unpause token



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to be unpaused |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int256 | The response code for the status of the request. SUCCESS is 22. |

### updateTokenExpiryInfo

```solidity
function updateTokenExpiryInfo(address token, IHederaTokenService.Expiry expiryInfo) external nonpayable returns (int256 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| expiryInfo | IHederaTokenService.Expiry | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int256 | undefined |

### updateTokenKeys

```solidity
function updateTokenKeys(address token, IHederaTokenService.TokenKey[] keys) external nonpayable returns (int64 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| keys | IHederaTokenService.TokenKey[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### wipeToken

```solidity
function wipeToken(address tokenAddress, address account, uint32 amount) external nonpayable returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| tokenAddress | address | undefined |
| account | address | undefined |
| amount | uint32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |




