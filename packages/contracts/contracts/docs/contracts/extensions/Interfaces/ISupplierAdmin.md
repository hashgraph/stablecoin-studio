# ISupplierAdmin









## Methods

### decreaseSupplierAllowance

```solidity
function decreaseSupplierAllowance(address supplier, uint256 amount) external nonpayable
```



*Decreases the supplier allowance of the `supplier`, reducing the `amount` that the supplier can mint*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to subtract from the supplier&#39;s current supplier allowance |

### getSupplierAllowance

```solidity
function getSupplierAllowance(address supplier) external view returns (uint256)
```



*Return number of tokens allowed to be minted of the address account `supplier`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The number of tokens allowed to be minted |

### grantSupplierRole

```solidity
function grantSupplierRole(address supplier, uint256 amount) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and sets the `amount` the supplier can mint, if you don&#39;t already have unlimited supplier&#39;s allowance permission*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount of tokens to set the supplier allowance |

### grantUnlimitedSupplierRole

```solidity
function grantUnlimitedSupplierRole(address supplier) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and sets unlimited supplier&#39;s allowance permission.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### increaseSupplierAllowance

```solidity
function increaseSupplierAllowance(address supplier, uint256 amount) external nonpayable
```



*Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to add to the supplier&#39;s current minting allowance |

### isUnlimitedSupplierAllowance

```solidity
function isUnlimitedSupplierAllowance(address supplier) external view returns (bool)
```



*Validate if the address account `supplier&#39; has unlimited supplier&#39;s allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if is unlimited supplier&#39;s allowance |

### resetSupplierAllowance

```solidity
function resetSupplierAllowance(address supplier) external nonpayable
```



*Reset the supplier&#39;s allowance to 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### revokeSupplierRole

```solidity
function revokeSupplierRole(address supplier) external nonpayable
```



*Revoke `SUPPLIER ROLE&#39; to perform supplier&#39;s allowance and revoke unlimited supplier&#39;s allowance permission*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |



## Events

### SupplierAllowanceDecreased

```solidity
event SupplierAllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance)
```



*Emitted when a supply controller decreases a supplier&#39;s allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | The caller of the function that emitted the event |
| supplier `indexed` | address | The supplier account |
| amount  | uint256 | The amount to decrease supplier allowance by |
| oldAllowance  | uint256 | The supplier allowance before the decrease |
| newAllowance  | uint256 | The supplier allowance after the decrease |

### SupplierAllowanceIncreased

```solidity
event SupplierAllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance)
```



*Emitted when a supply controller increases a supplier&#39;s allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | The caller of the function that emitted the event |
| supplier `indexed` | address | The supplier account |
| amount  | uint256 | The amount to increase supplier allowance by |
| oldAllowance  | uint256 | The supplier allowance before the increase |
| newAllowance  | uint256 | The supplier allowance after the increase |

### SupplierAllowanceReset

```solidity
event SupplierAllowanceReset(address indexed sender, address indexed supplier, uint256 oldAllowance, uint256 newAllowance)
```



*Emitted when a supply controller resets a supplier&#39;s allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | The caller of the function that emitted the event |
| supplier `indexed` | address | The supplier account |
| oldAllowance  | uint256 | The supplier allowance before the reset |
| newAllowance  | uint256 | The supplier allowance after the reset (expected to be 0) |



## Errors

### AccountHasUnlimitedSupplierAllowance

```solidity
error AccountHasUnlimitedSupplierAllowance(address account)
```



*Emitted when the supplier account already has unlimited supplier allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to grant supplier role to |


