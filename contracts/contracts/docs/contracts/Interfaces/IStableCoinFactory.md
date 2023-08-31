# IStableCoinFactory









## Methods

### addHederaTokenManagerVersion

```solidity
function addHederaTokenManagerVersion(address newAddress) external nonpayable
```



*Adds a new stable coin to contract addresses*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAddress | address | The new address |

### changeAdmin

```solidity
function changeAdmin(address newAddress) external nonpayable
```



*Changes the admin address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAddress | address | The new address |

### deployStableCoin

```solidity
function deployStableCoin(IStableCoinFactory.TokenStruct requestedToken, address stableCoinContractAddress) external payable returns (struct IStableCoinFactory.DeployedStableCoin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| requestedToken | IStableCoinFactory.TokenStruct | undefined |
| stableCoinContractAddress | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | IStableCoinFactory.DeployedStableCoin | undefined |

### editHederaTokenManagerAddress

```solidity
function editHederaTokenManagerAddress(uint256 index, address newAddress) external nonpayable
```



*Edits a stable coin contract address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | The index of the address |
| newAddress | address | The new address |

### getAdmin

```solidity
function getAdmin() external view returns (address)
```



*Gets the admin address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The admin address |

### getHederaTokenManagerAddress

```solidity
function getHederaTokenManagerAddress() external view returns (address[])
```



*Gets the HederaTokenManager contract address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |

### removeHederaTokenManagerAddress

```solidity
function removeHederaTokenManagerAddress(uint256 index) external nonpayable
```



*Removes a stable coin contract address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | The index of the address |



## Events

### AdminChanged

```solidity
event AdminChanged(address indexed oldAdmin, address indexed newAdmin)
```



*Emitted when the address of a HederaTokenManager contract is removed from the array*

#### Parameters

| Name | Type | Description |
|---|---|---|
| oldAdmin `indexed` | address | The index of the array for which the HederaTokenManager contract address to be removed |
| newAdmin `indexed` | address | The HederaTokenManager contract address to be removed |

### Deployed

```solidity
event Deployed(IStableCoinFactory.DeployedStableCoin deployedStableCoin)
```



*Emitted when a new stable coin is deployed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| deployedStableCoin  | IStableCoinFactory.DeployedStableCoin | The new deployed stable coin |

### HederaTokenManagerAddressAdded

```solidity
event HederaTokenManagerAddressAdded(address indexed newHederaTokenManager)
```



*Emitted when the address of a HederaTokenManager contract is added to the array*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newHederaTokenManager `indexed` | address | The HederaTokenManager contract address to be added |

### HederaTokenManagerAddressEdited

```solidity
event HederaTokenManagerAddressEdited(address indexed oldAddress, address indexed newAddress)
```



*Emitted when the address of a HederaTokenManager contract is changed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| oldAddress `indexed` | address | The old HederaTokenManager contract address |
| newAddress `indexed` | address | The new HederaTokenManager contract address |

### HederaTokenManagerAddressRemoved

```solidity
event HederaTokenManagerAddressRemoved(uint256 index, address indexed addressRemoved)
```



*Emitted when the address of a HederaTokenManager contract is removed*

#### Parameters

| Name | Type | Description |
|---|---|---|
| index  | uint256 | The index of the array for which the HederaTokenManager contract address to be removed |
| addressRemoved `indexed` | address | The HederaTokenManager contract address to be removed |

### StableCoinFactoryInitialized

```solidity
event StableCoinFactoryInitialized()
```



*Emitted when a stable coin factory is initialized*




## Errors

### AddressZero

```solidity
error AddressZero(address addr)
```



*Emitted when the provided `addr` is 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The address to check |

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

### OnlyAdministratorFunction

```solidity
error OnlyAdministratorFunction(address addr)
```



*Emitted when a function is called by the Factory non administrator account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The account trying to execute the function |


