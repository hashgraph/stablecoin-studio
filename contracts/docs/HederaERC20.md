# HederaERC20









## Methods

### BURN_ROLE

```solidity
function BURN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### CASHIN_ROLE

```solidity
function CASHIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### DEFAULT_ADMIN_ROLE

```solidity
function DEFAULT_ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### FREEZE_ROLE

```solidity
function FREEZE_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### PAUSE_ROLE

```solidity
function PAUSE_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### RESCUE_ROLE

```solidity
function RESCUE_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### ROLES

```solidity
function ROLES(uint256) external view returns (bytes32)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### WIPE_ROLE

```solidity
function WIPE_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### allowance

```solidity
function allowance(address, address) external pure returns (uint256)
```



*Function not already implemented*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### approve

```solidity
function approve(address, uint256) external pure returns (bool)
```



*Function not already implemented*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### associateToken

```solidity
function associateToken(address adr) external nonpayable returns (bool)
```



*Associates a account to the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| adr | address | The address of the account to associate |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the account has been successfully associated with the token |

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```



*Returns the number tokens that an account has*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account to be consulted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The number number tokens that an account has |

### burn

```solidity
function burn(uint256 amount) external nonpayable returns (bool)
```



*Burns an `amount` of tokens owned by the treasury account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of tokens to be burned |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### decimals

```solidity
function decimals() external view returns (uint8)
```



*Returns the number of decimals of the token *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint8 | uint8 The number of decimals of the token |

### decreaseSupplierAllowance

```solidity
function decreaseSupplierAllowance(address supplier, uint256 amount) external nonpayable
```



*Decreases the minting allowance of the `supplier`, reducing the `amount` that the supplier can mint. Validate that the amount must be greater than zero, and the amount must not exceed the supplier allowance. Emits a SupplierAllowanceDecreased event. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to subtract from the supplier&#39;s current minting allowance |

### delegateTransferFrom

```solidity
function delegateTransferFrom(address token, address from, address to, uint256 amount) external nonpayable returns (int64 responseCode)
```

Only applicable to fungible tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the fungible Hedera token to transfer |
| from | address | The account address of the owner of the token, on the behalf of which to transfer `amount` tokens |
| to | address | The account address of the receiver of the `amount` tokens |
| amount | uint256 | The amount of tokens to transfer from `from` to `to` |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### delegateTransferFromNFT

```solidity
function delegateTransferFromNFT(address token, address from, address to, uint256 serialNumber) external nonpayable returns (int64 responseCode)
```

Transfers `serialNumber` of `token` from `from` to `to` using the allowance mechanism. Only applicable to NFT tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the non-fungible Hedera token to transfer |
| from | address | The account address of the owner of `serialNumber` of `token` |
| to | address | The account address of the receiver of `serialNumber` |
| serialNumber | uint256 | The NFT serial number to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### dissociateToken

```solidity
function dissociateToken(address adr) external nonpayable returns (bool)
```



*Dissociates an account from the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| adr | address | The address of the account to dissociate |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | bool True if the account has been successfully dissociated from the token |

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

### getRoleAdmin

```solidity
function getRoleAdmin(bytes32 role) external view returns (bytes32)
```



*Returns the admin role that controls `role`. See {grantRole} and {revokeRole}. To change a role&#39;s admin, use {_setRoleAdmin}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

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

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```



*Returns the token address *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address The token address |

### getTokenOwnerAddress

```solidity
function getTokenOwnerAddress() external view returns (address)
```



*Returns the HTSTokenOwner contract address  *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | address HTSTokenOwner contract address |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants `role` to `account`. If `account` had not been already granted `role`, emits a {RoleGranted} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleGranted} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### grantSupplierRole

```solidity
function grantSupplierRole(address supplier, uint256 amount) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and sets the `amount`  the supplier can mint, if you don&#39;t already have unlimited supplier&#39;s allowance permission. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to add to the supplier&#39;s current minting allowance  |

### grantUnlimitedSupplierRole

```solidity
function grantUnlimitedSupplierRole(address supplier) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance, sets unlimited  supplier&#39;s allowance permission, and sets the `amount` the supplier can mint to 0. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Returns `true` if `account` has been granted `role`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### increaseSupplierAllowance

```solidity
function increaseSupplierAllowance(address supplier, uint256 amount) external nonpayable
```



*Increases the minting allowance of the `supplier`, increasing the `amount` the supplier can mint. Validate that the amount must be greater than zero. Emits a SupplierAllowanceIncreased event. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to add to the supplier&#39;s current minting allowance |

### initialize

```solidity
function initialize() external payable
```






### isUnlimitedSupplierAllowance

```solidity
function isUnlimitedSupplierAllowance(address supplier) external view returns (bool)
```



*Validate if the address account `supplier&#39; is unlimited supplier&#39;s allowance.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | True if is unlimited supplier&#39;s allowance  |

### mint

```solidity
function mint(address account, uint256 amount) external nonpayable returns (bool)
```



*Creates an `amount` of tokens and transfers them to an `account`, increasing the total supply*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address that receives minted tokens |
| amount | uint256 | The number of tokens to be minted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### name

```solidity
function name() external view returns (string)
```



*Returns the name of the token *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The the name of the token |

### pause

```solidity
function pause() external nonpayable returns (bool)
```



*Pauses the token in order to prevent it from being involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### renounceRole

```solidity
function renounceRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from the calling account. Roles are often managed via {grantRole} and {revokeRole}: this function&#39;s purpose is to provide a mechanism for accounts to lose their privileges if they are compromised (such as when a trusted device is misplaced). If the calling account had been revoked `role`, emits a {RoleRevoked} event. Requirements: - the caller must be `account`. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### rescueHbar

```solidity
function rescueHbar(uint256 amount) external nonpayable
```



*Rescue `value` hbar from contractTokenOwner to rescuer Must be protected with RESCUE_ROLE*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of tinyhbar to rescue |

### rescueToken

```solidity
function rescueToken(uint256 amount) external nonpayable
```



*Rescue `value` `tokenId` from contractTokenOwner to rescuer  Must be protected with isRescuer()*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of tokens to rescuer |

### resetSupplierAllowance

```solidity
function resetSupplierAllowance(address supplier) external nonpayable
```



*Reset a supplier&#39;s allowance to 0. Emits a SupplierAllowanceReset event Only the &#39;ADMIN SUPPLIER ROLE` can execute*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes `role` from `account`. If `account` had been granted `role`, emits a {RoleRevoked} event. Requirements: - the caller must have ``role``&#39;s admin role. May emit a {RoleRevoked} event.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | undefined |
| account | address | undefined |

### revokeSupplierRole

```solidity
function revokeSupplierRole(address supplier) external nonpayable
```



*Revoke `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and revoke unlimited  supplier&#39;s allowance permission.     Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### setTokenAddress

```solidity
function setTokenAddress(contract HTSTokenOwner htsTokenOwnerAddress, address tokenAddress) external nonpayable
```



*Assigns the HTSTokenOwner contract address and the token address, validating that the  token address was not already assigned*

#### Parameters

| Name | Type | Description |
|---|---|---|
| htsTokenOwnerAddress | contract HTSTokenOwner | The  contract address HTSTokenOwner |
| tokenAddress | address | The token address created |

### supplierAllowance

```solidity
function supplierAllowance(address supplier) external view returns (uint256)
```



*Retrun number of tokens allowed to be minted of the address account `supplier`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of tokens allowed to be minted  |

### supportsInterface

```solidity
function supportsInterface(bytes4 interfaceId) external view returns (bool)
```



*See {IERC165-supportsInterface}.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| interfaceId | bytes4 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### symbol

```solidity
function symbol() external view returns (string)
```



*Returns the symbol of the token *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The the symbol of the token |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the total number of tokens that exits *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The total number of tokens that exists |

### transfer

```solidity
function transfer(address, uint256) external pure returns (bool)
```



*Function not already implemented*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transferFrom

```solidity
function transferFrom(address token, address from, address to, uint256 amount) external nonpayable returns (int64 responseCode)
```

Only applicable to fungible tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the fungible Hedera token to transfer |
| from | address | The account address of the owner of the token, on the behalf of which to transfer `amount` tokens |
| to | address | The account address of the receiver of the `amount` tokens |
| amount | uint256 | The amount of tokens to transfer from `from` to `to` |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### transferFrom

```solidity
function transferFrom(address, address, uint256) external pure returns (bool)
```



*Function not already implemented*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |
| _1 | address | undefined |
| _2 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### transferFromNFT

```solidity
function transferFromNFT(address token, address from, address to, uint256 serialNumber) external nonpayable returns (int64 responseCode)
```

Transfers `serialNumber` of `token` from `from` to `to` using the allowance mechanism. Only applicable to NFT tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The address of the non-fungible Hedera token to transfer |
| from | address | The account address of the owner of `serialNumber` of `token` |
| to | address | The account address of the receiver of `serialNumber` |
| serialNumber | uint256 | The NFT serial number to transfer |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

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

### unpause

```solidity
function unpause() external nonpayable returns (bool)
```



*Unpauses the token in order to allow it to be involved in any kind of operation*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### wipe

```solidity
function wipe(address account, uint32 amount) external nonpayable returns (bool)
```



*Operation to wipe a token amount (`amount`) from account (`account`).     Validate that there is sufficient token balance before wipe. Only the &#39;WIPE ROLE` can execute Emits a TokensWiped event *

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account where to wipe the token |
| amount | uint32 | The number of tokens to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | True if successful     |



## Events

### Approval

```solidity
event Approval(address indexed owner, address indexed spender, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| owner `indexed` | address | undefined |
| spender `indexed` | address | undefined |
| value  | uint256 | undefined |

### HbarRescued

```solidity
event HbarRescued(address rescuer, uint256 amount, uint256 oldAmount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer  | address | undefined |
| amount  | uint256 | undefined |
| oldAmount  | uint256 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### RoleAdminChanged

```solidity
event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| previousAdminRole `indexed` | bytes32 | undefined |
| newAdminRole `indexed` | bytes32 | undefined |

### RoleGranted

```solidity
event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### RoleRevoked

```solidity
event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| role `indexed` | bytes32 | undefined |
| account `indexed` | address | undefined |
| sender `indexed` | address | undefined |

### SupplierAllowanceDecreased

```solidity
event SupplierAllowanceDecreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| supplier `indexed` | address | undefined |
| amount  | uint256 | undefined |
| oldAllowance  | uint256 | undefined |
| newAllowance  | uint256 | undefined |

### SupplierAllowanceIncreased

```solidity
event SupplierAllowanceIncreased(address indexed sender, address indexed supplier, uint256 amount, uint256 oldAllowance, uint256 newAllowance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| supplier `indexed` | address | undefined |
| amount  | uint256 | undefined |
| oldAllowance  | uint256 | undefined |
| newAllowance  | uint256 | undefined |

### SupplierAllowanceReset

```solidity
event SupplierAllowanceReset(address indexed sender, address indexed supplier, uint256 oldAllowance, uint256 newAllowance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| sender `indexed` | address | undefined |
| supplier `indexed` | address | undefined |
| oldAllowance  | uint256 | undefined |
| newAllowance  | uint256 | undefined |

### TokenPaused

```solidity
event TokenPaused(address token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |

### TokenRescued

```solidity
event TokenRescued(address rescuer, address tokenId, uint256 amount, uint256 oldBalance)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer  | address | undefined |
| tokenId  | address | undefined |
| amount  | uint256 | undefined |
| oldBalance  | uint256 | undefined |

### TokenUnpaused

```solidity
event TokenUnpaused(address token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |

### TokensWiped

```solidity
event TokensWiped(address token, address account, uint32 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| account  | address | undefined |
| amount  | uint32 | undefined |

### Transfer

```solidity
event Transfer(address indexed from, address indexed to, uint256 value)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| from `indexed` | address | undefined |
| to `indexed` | address | undefined |
| value  | uint256 | undefined |

### TransfersFreezed

```solidity
event TransfersFreezed(address token, address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| account  | address | undefined |

### TransfersUnfreezed

```solidity
event TransfersUnfreezed(address token, address account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| account  | address | undefined |



