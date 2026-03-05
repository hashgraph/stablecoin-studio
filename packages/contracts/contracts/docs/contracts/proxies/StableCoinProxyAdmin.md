# StableCoinProxyAdmin









## Methods

### acceptOwnership

```solidity
function acceptOwnership() external nonpayable
```



*The new owner accepts the ownership transfer.*


### changeProxyAdmin

```solidity
function changeProxyAdmin(contract ITransparentUpgradeableProxy proxy, address newAdmin) external nonpayable
```



*Changes the admin of `proxy` to `newAdmin`. Requirements: - This contract must be the current admin of `proxy`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract ITransparentUpgradeableProxy | undefined |
| newAdmin | address | undefined |

### getProxyAdmin

```solidity
function getProxyAdmin(contract ITransparentUpgradeableProxy proxy) external view returns (address)
```



*Returns the current admin of `proxy`. Requirements: - This contract must be the admin of `proxy`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract ITransparentUpgradeableProxy | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getProxyImplementation

```solidity
function getProxyImplementation(contract ITransparentUpgradeableProxy proxy) external view returns (address)
```



*Returns the current implementation of `proxy`. Requirements: - This contract must be the admin of `proxy`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract ITransparentUpgradeableProxy | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### owner

```solidity
function owner() external view returns (address)
```



*Returns the address of the current owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### pendingOwner

```solidity
function pendingOwner() external view returns (address)
```



*Returns the address of the pending owner.*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby disabling any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |

### upgrade

```solidity
function upgrade(contract ITransparentUpgradeableProxy proxy, address implementation) external nonpayable
```



*Upgrades `proxy` to `implementation`. See {TransparentUpgradeableProxy-upgradeTo}. Requirements: - This contract must be the admin of `proxy`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract ITransparentUpgradeableProxy | undefined |
| implementation | address | undefined |

### upgradeAndCall

```solidity
function upgradeAndCall(contract ITransparentUpgradeableProxy proxy, address implementation, bytes data) external payable
```



*Upgrades `proxy` to `implementation` and calls a function on the new implementation. See {TransparentUpgradeableProxy-upgradeToAndCall}. Requirements: - This contract must be the admin of `proxy`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| proxy | contract ITransparentUpgradeableProxy | undefined |
| implementation | address | undefined |
| data | bytes | undefined |



## Events

### OwnershipTransferStarted

```solidity
event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |



