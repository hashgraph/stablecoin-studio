# StableCoinFactoryWrapper









## Methods

### changeFactory

```solidity
function changeFactory(address newFactory) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFactory | address | undefined |

### deployStableCoin

```solidity
function deployStableCoin(IStableCoinFactory.tokenStruct requestedToken) external payable returns (address, address, address, address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| requestedToken | IStableCoinFactory.tokenStruct | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |
| _2 | address | undefined |
| _3 | address | undefined |

### getFactory

```solidity
function getFactory() external view returns (address)
```






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

### renounceOwnership

```solidity
function renounceOwnership() external nonpayable
```



*Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore. Can only be called by the current owner. NOTE: Renouncing ownership will leave the contract without an owner, thereby removing any functionality that is only available to the owner.*


### transferOwnership

```solidity
function transferOwnership(address newOwner) external nonpayable
```



*Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newOwner | address | undefined |



## Events

### OwnershipTransferred

```solidity
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousOwner `indexed` | address | undefined |
| newOwner `indexed` | address | undefined |

### newFactoryAddress

```solidity
event newFactoryAddress(address indexed previousFactory, address indexed newFactory)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousFactory `indexed` | address | undefined |
| newFactory `indexed` | address | undefined |



