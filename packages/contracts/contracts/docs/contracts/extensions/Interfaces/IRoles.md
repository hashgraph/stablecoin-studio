# IRoles









## Methods

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
| _0 | bytes32 | bytes32 The bytes32 of the role |

### getRoles

```solidity
function getRoles(address account) external view returns (bytes32[])
```



*Returns an array of roles the account currently has*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account address |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32[] | bytes32[] The array containing the roles |



## Events

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```



*Emitted when a role is granted to an account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | The role to be granted |
| account `indexed` | address | The account for which the role is to be granted |
| sender `indexed` | address | The caller of the function that emitted the event |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```



*Emitted when a role is revoked from an account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | The role to be revoked |
| account `indexed` | address | The account for which the role is to be revoked |
| sender `indexed` | address | The caller of the function that emitted the event |



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


