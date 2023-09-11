# StableCoinFactory









## Methods

### addHederaTokenManagerVersion

```solidity
function addHederaTokenManagerVersion(address newAddress) external nonpayable
```



*Add a new stablecoin to contract addresses*

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



*Edit a stablecoin contract address*

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



*Get the stablecoin contract addresses*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | The stablecoin contract addresses |

### initialize

```solidity
function initialize(address admin, address hederaTokenManager) external nonpayable
```



*Initialize the contract*

#### Parameters

| Name | Type | Description |
|---|---|---|
| admin | address | The address of the admin |
| hederaTokenManager | address | The address of the hedera token manager |

### removeHederaTokenManagerAddress

```solidity
function removeHederaTokenManagerAddress(uint256 index) external nonpayable
```



*Removes a stablecoin contract address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| index | uint256 | The index of the address |



## Events

### AdminChanged

```solidity
event AdminChanged(address indexed oldAdmin, address indexed newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| oldAdmin `indexed` | address | undefined |
| newAdmin `indexed` | address | undefined |

### Deployed

```solidity
event Deployed(IStableCoinFactory.DeployedStableCoin deployedStableCoin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| deployedStableCoin  | IStableCoinFactory.DeployedStableCoin | undefined |

### HederaTokenManagerAddressAdded

```solidity
event HederaTokenManagerAddressAdded(address indexed newHederaTokenManager)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newHederaTokenManager `indexed` | address | undefined |

### HederaTokenManagerAddressEdited

```solidity
event HederaTokenManagerAddressEdited(address indexed oldAddress, address indexed newAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| oldAddress `indexed` | address | undefined |
| newAddress `indexed` | address | undefined |

### HederaTokenManagerAddressRemoved

```solidity
event HederaTokenManagerAddressRemoved(uint256 index, address indexed addressRemoved)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| index  | uint256 | undefined |
| addressRemoved `indexed` | address | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### StableCoinFactoryInitialized

```solidity
event StableCoinFactoryInitialized()
```








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


