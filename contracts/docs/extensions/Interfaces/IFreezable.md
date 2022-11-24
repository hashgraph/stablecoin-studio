# IFreezable









## Methods

### freeze

```solidity
function freeze(address account) external nonpayable returns (bool)
```



*Freezes transfers of the token for the `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account whose transfers will be freezed for the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### unfreeze

```solidity
function unfreeze(address account) external nonpayable returns (bool)
```



*Freezes transfers of the token for the `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account whose transfers will be unfreezed for the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### TransfersFrozen

```solidity
event TransfersFrozen(address token, address account)
```



*Emitted when freezing transfers of the token for the `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| account  | address | Account address |

### TransfersUnfrozen

```solidity
event TransfersUnfrozen(address token, address account)
```



*Emitted when unfreezing transfers of the token for the `account`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| account  | address | Account address |



