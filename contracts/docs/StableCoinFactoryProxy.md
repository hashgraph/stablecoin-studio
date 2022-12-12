# StableCoinFactoryProxy









## Methods

### admin

```solidity
function admin() external nonpayable returns (address admin_)
```



*Returns the current admin. NOTE: Only the admin can call this function. See {ProxyAdmin-getProxyAdmin}. TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using the https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call. `0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103`*


#### Returns

| Name | Type | Description |
|---|---|---|
| admin_ | address | undefined |

### changeAdmin

```solidity
function changeAdmin(address newAdmin) external nonpayable
```



*Changes the admin of the proxy. Emits an {AdminChanged} event. NOTE: Only the admin can call this function. See {ProxyAdmin-changeProxyAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAdmin | address | undefined |

### implementation

```solidity
function implementation() external nonpayable returns (address implementation_)
```



*Returns the current implementation. NOTE: Only the admin can call this function. See {ProxyAdmin-getProxyImplementation}. TIP: To get this value clients can read directly from the storage slot shown below (specified by EIP1967) using the https://eth.wiki/json-rpc/API#eth_getstorageat[`eth_getStorageAt`] RPC call. `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`*


#### Returns

| Name | Type | Description |
|---|---|---|
| implementation_ | address | undefined |

### upgradeTo

```solidity
function upgradeTo(address newImplementation) external nonpayable
```



*Upgrade the implementation of the proxy. NOTE: Only the admin can call this function. See {ProxyAdmin-upgrade}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address newImplementation, bytes data) external payable
```



*Upgrade the implementation of the proxy, and then call a function from the new implementation as specified by `data`, which should be an encoded function call. This is useful to initialize new storage variables in the proxied contract. NOTE: Only the admin can call this function. See {ProxyAdmin-upgradeAndCall}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newImplementation | address | undefined |
| data | bytes | undefined |



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



