# HederaTokenManager









## Methods

### ADMIN_ROLE

```solidity
function ADMIN_ROLE() external view returns (bytes32)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

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
function burn(int64 amount) external nonpayable returns (bool)
```



*Burns an `amount` of tokens owned by the treasury account*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int64 | The number of tokens to be burned |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### decimals

```solidity
function decimals() external view returns (uint8)
```



*Returns the number of decimals of the token*


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

### deleteToken

```solidity
function deleteToken() external nonpayable returns (bool)
```



*Deletes the token*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

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

### getAccountsWithRole

```solidity
function getAccountsWithRole(bytes32 role) external view returns (address[])
```



*Gets the list of accounts that have been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role that the accounts have to be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address[] | undefined |

### getMetadata

```solidity
function getMetadata() external view returns (string)
```



*Gets the metadata*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### getNumberOfAccountsWithRole

```solidity
function getNumberOfAccountsWithRole(bytes32 role) external view returns (uint256)
```



*Gets the number of accounts that have been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role that the accounts have to be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### getReserveAddress

```solidity
function getReserveAddress() external view returns (address)
```



*Gets the current reserve address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### getReserveAmount

```solidity
function getReserveAmount() external view returns (int256)
```



*Gets the current reserve amount*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | int256 | undefined |

### getRoleId

```solidity
function getRoleId(enum IRoles.RoleName role) external view returns (bytes32)
```



*Returns a role bytes32 representation*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | enum IRoles.RoleName | The role we want to retrieve the bytes32 for |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bytes32 | undefined |

### getRoles

```solidity
function getRoles(address account) external view returns (bytes32[] rolesToReturn)
```



*Returns an array of roles the account currently has*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account address |

#### Returns

| Name | Type | Description |
|---|---|---|
| rolesToReturn | bytes32[] | undefined |

### getSupplierAllowance

```solidity
function getSupplierAllowance(address supplier) external view returns (uint256)
```



*Return number of tokens allowed to be minted of the address account `supplier`.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | The number of tokens allowed to be minted |

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```



*Returns the token address*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### grantKyc

```solidity
function grantKyc(address account) external nonpayable returns (bool)
```



*Grants KYC to account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to which the KYC will be granted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### grantRole

```solidity
function grantRole(bytes32 role, address account) external nonpayable
```



*Grants a role to an account Only the &#39;ADMIN ROLE` can execute Emits a RoleGranted event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role to be granted |
| account | address | The account to wich the role is granted |

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

### grantSupplierRole

```solidity
function grantSupplierRole(address supplier, uint256 amount) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and sets the `amount` the supplier can mint, if you don&#39;t already have unlimited supplier&#39;s allowance permission. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |
| amount | uint256 | The amount to add to the supplier&#39;s current minting allowance |

### grantUnlimitedSupplierRole

```solidity
function grantUnlimitedSupplierRole(address supplier) external nonpayable
```



*Gives `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance, sets unlimited supplier&#39;s allowance permission, and sets the `amount` the supplier can mint to 0. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### hasRole

```solidity
function hasRole(bytes32 role, address account) external view returns (bool)
```



*Checks if the account has been granted a role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role the check if was granted |
| account | address | The account to check if it has the role granted |

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
function initialize(IHederaTokenManager.InitializeStruct init) external payable returns (address)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| init | IHederaTokenManager.InitializeStruct | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

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
| _0 | bool | True if is unlimited supplier&#39;s allowance |

### mint

```solidity
function mint(address account, int64 amount) external nonpayable returns (bool)
```



*Creates an `amount` of tokens and transfers them to an `account`, increasing the total supply*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address that receives minted tokens |
| amount | int64 | The number of tokens to be minted |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### name

```solidity
function name() external view returns (string)
```



*Returns the name of the token*


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

### rescue

```solidity
function rescue(int64 amount) external nonpayable returns (bool)
```



*Rescues `value` `tokenId` from contractTokenOwner to rescuer Must be protected with isRescuer()*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int64 | The number of tokens to rescuer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### rescueHBAR

```solidity
function rescueHBAR(uint256 amount) external nonpayable returns (bool)
```



*Rescues `value` HBAR from contractTokenOwner to rescuer Must be protected with isRescuer()*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The number of HBAR to rescuer |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### resetSupplierAllowance

```solidity
function resetSupplierAllowance(address supplier) external nonpayable
```



*Reset a supplier&#39;s allowance to 0. Emits a SupplierAllowanceReset event Only the &#39;ADMIN SUPPLIER ROLE` can execute*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### revokeKyc

```solidity
function revokeKyc(address account) external nonpayable returns (bool)
```



*Revokes KYC to account for the token*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to which the KYC will be revoked |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### revokeRole

```solidity
function revokeRole(bytes32 role, address account) external nonpayable
```



*Revokes a role from an account Only the &#39;ADMIN ROLE` can execute Emits a RoleRevoked event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| role | bytes32 | The role to be revoked |
| account | address | The account to wich the role is revoked |

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

### revokeSupplierRole

```solidity
function revokeSupplierRole(address supplier) external nonpayable
```



*Revoke `SUPPLIER ROLE&#39; permissions to perform supplier&#39;s allowance and revoke unlimited supplier&#39;s allowance permission. Only the &#39;ADMIN SUPPLIER ROLE` can execute.*

#### Parameters

| Name | Type | Description |
|---|---|---|
| supplier | address | The address of the supplier |

### symbol

```solidity
function symbol() external view returns (string)
```



*Returns the symbol of the token*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | string The the symbol of the token |

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```



*Returns the total number of tokens that exits*


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | uint256 The total number of tokens that exists |

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

### updateReserveAddress

```solidity
function updateReserveAddress(address newAddress) external nonpayable
```



*Updates de reserve address*

#### Parameters

| Name | Type | Description |
|---|---|---|
| newAddress | address | The new reserve address |

### updateToken

```solidity
function updateToken(IHederaTokenManager.UpdateTokenStruct updatedToken) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| updatedToken | IHederaTokenManager.UpdateTokenStruct | undefined |

### wipe

```solidity
function wipe(address account, int64 amount) external nonpayable returns (bool)
```



*Operation to wipe a token amount (`amount`) from account (`account`). Validate that there is sufficient token balance before wipe. Only the &#39;WIPE ROLE` can execute Emits a TokensWiped event*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The address of the account where to wipe the token |
| amount | int64 | The number of tokens to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |



## Events

### GrantTokenKyc

```solidity
event GrantTokenKyc(address indexed token, address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| account `indexed` | address | undefined |

### HBARRescued

```solidity
event HBARRescued(address indexed rescuer, uint256 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer `indexed` | address | undefined |
| amount  | uint256 | undefined |

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### MetadataSet

```solidity
event MetadataSet(address indexed admin, string metadata)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| admin `indexed` | address | undefined |
| metadata  | string | undefined |

### ReserveAddressChanged

```solidity
event ReserveAddressChanged(address indexed previousAddress, address indexed newAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| previousAddress `indexed` | address | undefined |
| newAddress `indexed` | address | undefined |

### RevokeTokenKyc

```solidity
event RevokeTokenKyc(address indexed token, address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| account `indexed` | address | undefined |

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

### TokenDeleted

```solidity
event TokenDeleted(address indexed token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |

### TokenPaused

```solidity
event TokenPaused(address indexed token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |

### TokenRescued

```solidity
event TokenRescued(address indexed rescuer, address indexed tokenId, int64 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| rescuer `indexed` | address | undefined |
| tokenId `indexed` | address | undefined |
| amount  | int64 | undefined |

### TokenTransfer

```solidity
event TokenTransfer(address indexed token, address indexed sender, address indexed receiver, int64 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| sender `indexed` | address | undefined |
| receiver `indexed` | address | undefined |
| amount  | int64 | undefined |

### TokenUnpaused

```solidity
event TokenUnpaused(address indexed token)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |

### TokenUpdated

```solidity
event TokenUpdated(address indexed token, IHederaTokenManager.UpdateTokenStruct updateTokenStruct, address newTreasury)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| updateTokenStruct  | IHederaTokenManager.UpdateTokenStruct | undefined |
| newTreasury  | address | undefined |

### TokensBurned

```solidity
event TokensBurned(address indexed burner, address indexed token, int64 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| burner `indexed` | address | undefined |
| token `indexed` | address | undefined |
| amount  | int64 | undefined |

### TokensMinted

```solidity
event TokensMinted(address indexed minter, address indexed token, int64 amount, address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| minter `indexed` | address | undefined |
| token `indexed` | address | undefined |
| amount  | int64 | undefined |
| account `indexed` | address | undefined |

### TokensWiped

```solidity
event TokensWiped(address indexed wiper, address indexed token, address indexed account, int64 amount)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| wiper `indexed` | address | undefined |
| token `indexed` | address | undefined |
| account `indexed` | address | undefined |
| amount  | int64 | undefined |

### TransfersFrozen

```solidity
event TransfersFrozen(address indexed token, address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| account `indexed` | address | undefined |

### TransfersUnfrozen

```solidity
event TransfersUnfrozen(address indexed token, address indexed account)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token `indexed` | address | undefined |
| account `indexed` | address | undefined |



## Errors

### AccountHasNoRole

```solidity
error AccountHasNoRole(address account, bytes32 role)
```



*Emitted when the provided account is not granted the role*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account for which the role is checked for granted |
| role | bytes32 | The role that is checked to see if the account has been granted |

### AccountHasUnlimitedSupplierAllowance

```solidity
error AccountHasUnlimitedSupplierAllowance(address account)
```



*Emitted when the supplier account already has unlimited supplier allowance*

#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to grant supplier role to |

### AddressZero

```solidity
error AddressZero(address addr)
```



*Emitted when the provided `addr` is 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| addr | address | The address to check |

### AmountBiggerThanReserve

```solidity
error AmountBiggerThanReserve(uint256 amount)
```



*Emitted when the provided `amount` is bigger than the current reserve*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |

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

### FormatNumberIncorrect

```solidity
error FormatNumberIncorrect(uint256 amount)
```



*Emitted when the provided `amount` has an invalid format*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |

### GreaterThan

```solidity
error GreaterThan(uint256 value, uint256 ref)
```



*Emitted when the provided `value` is not greater than `ref`*

#### Parameters

| Name | Type | Description |
|---|---|---|
| value | uint256 | The value to check |
| ref | uint256 | The reference value |

### HBARRescueError

```solidity
error HBARRescueError(uint256 amount)
```



*Emitted when rescuing HBAR did not work*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The amount of HBAR to rescue |

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

### MoreThan100Error

```solidity
error MoreThan100Error(string s)
```



*Emitted when the provided `s` is less than 100 characters long*

#### Parameters

| Name | Type | Description |
|---|---|---|
| s | string | The string to check |

### NegativeAmount

```solidity
error NegativeAmount(int256 amount)
```



*Emitted when the provided `amount` is less than 0*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | int256 | The value to check |

### RefundingError

```solidity
error RefundingError(uint256 amount)
```



*Emitted when transfering funds back to original sender after creating the token did not work*

#### Parameters

| Name | Type | Description |
|---|---|---|
| amount | uint256 | The value to check |

### ResponseCodeInvalid

```solidity
error ResponseCodeInvalid(int256 code)
```



*Emitted when the provided `code` is not success*

#### Parameters

| Name | Type | Description |
|---|---|---|
| code | int256 | The code to check |


