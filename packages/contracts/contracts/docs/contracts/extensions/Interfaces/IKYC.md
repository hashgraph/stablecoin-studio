# IKYC









## Methods

### grantKyc

```solidity
function grantKyc(address account) external nonpayable returns (bool)
```



*Grants KYC to account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to which the KYC will be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### revokeKyc

```solidity
function revokeKyc(address account) external nonpayable returns (bool)
```



*Revokes KYC to account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to which the KYC will be revoked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### GrantTokenKyc

```solidity
event GrantTokenKyc(address indexed token, address indexed account)
```



*Emitted when the KYC is granted to an account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |
| account `indexed` | address | Token address |

### RevokeTokenKyc

```solidity
event RevokeTokenKyc(address indexed token, address indexed account)
```



*Emitted when the KYC is revoked to an account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | Token address |
| account `indexed` | address | Token address |



