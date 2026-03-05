# IRoleManagement









## Methods

### grantRoles

```solidity
function grantRoles(bytes32[] roles, address[] accounts, uint256[] amounts) external nonpayable
```



*Grant the provided &quot;roles&quot; to all the &quot;accounts&quot;, if CASHIN then &quot;amounts&quot; are the allowances*

#### Parameters

| Name | Type | Description |
|---|---|---|
| roles | bytes32[] | The list of roles to grant |
| accounts | address[] | The list of accounts to grant the roles to |
| amounts | uint256[] | The list of allowances for the accounts in case the &quot;cashin&quot; role must be provided |

### revokeRoles

```solidity
function revokeRoles(bytes32[] roles, address[] accounts) external nonpayable
```



*Revoke the provided &quot;roles&quot; from all the &quot;accounts&quot;*

#### Parameters

| Name | Type | Description |
|---|---|---|
| roles | bytes32[] | The list of roles to revoke |
| accounts | address[] | The list of accounts to revoke the roles from |




## Errors

### ArraysLengthNotEqual

```solidity
error ArraysLengthNotEqual(uint256 lengthArray1, uint256 lengthArray2)
```



*Emitted when `length_1` is not equal to `length_2`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| lengthArray1 | uint256 | The length of the first array |
| lengthArray2 | uint256 | The length of the second array |


