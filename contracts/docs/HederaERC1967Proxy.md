# HederaERC1967Proxy









## Methods

### getImplementation

```solidity
function getImplementation() external view returns (address)
```



*Returns the implementation behind the proxy*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address The address of the implementation behind the proxy |



## Events

### AdminChanged

```solidity
event AdminChanged(address previousAdmin, address newAdmin)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAdmin  | address | undefined |
| newAdmin  | address | undefined |

### BeaconUpgraded

```solidity
event BeaconUpgraded(address indexed beacon)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| beacon `indexed` | address | undefined |

### Upgraded

```solidity
event Upgraded(address indexed implementation)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| implementation `indexed` | address | undefined |



