# Pausable









## Methods

### ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### getAccountsWithRole

```solidity
function getAccountsWithRole(bytes32 role) external view returns (address[])
```



*Gets the list of accounts that have been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role that the accounts have to be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |

### getNumberOfAccountsWithRole

```solidity
function getNumberOfAccountsWithRole(bytes32 role) external view returns (uint256)
```



*Gets the number of accounts that have been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role that the accounts have to be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getRoleId

```solidity
function getRoleId(enum IRoles.RoleName role) external view returns (bytes32)
```



*Returns a role bytes32 representation*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | enum IRoles.RoleName | The role we want to retrieve the bytes32 for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### getRoles

```solidity
function getRoles(address account) external view returns (bytes32[] rolesToReturn)
```



*Returns an array of roles the account currently has*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account address |

#### Returns

| Name | Type | Description |
|---|---|---|
| rolesToReturn | bytes32[] | undefined |

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```



*Returns the token address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants a role to an account Only the &#39;ADMIN ROLE` can execute Emits a RoleGranted event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role to be granted |
| account | address | The account to wich the role is granted |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Checks if the account has been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role the check if was granted |
| account | address | The account to check if it has the role granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### pause

```solidity
function pause() external nonpayable returns (bool)
```



*Pauses the token in order to prevent it from being involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes a role from an account Only the &#39;ADMIN ROLE` can execute Emits a RoleRevoked event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role to be revoked |
| account | address | The account to wich the role is revoked |

### unpause

```solidity
function unpause() external nonpayable returns (bool)
```



*Unpauses the token in order to allow it to be involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### TokenPaused

```solidity
event TokenPaused(address indexed token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |

### TokenUnpaused

```solidity
event TokenUnpaused(address indexed token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |



## Errors

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```



*Emitted when the provided account is not granted the role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account for which the role is checked for granted |
| role | bytes32 | The role that is checked to see if the account has been granted |

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


