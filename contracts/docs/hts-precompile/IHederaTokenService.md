# IHederaTokenService









## Methods

### allowance

```solidity
function allowance(address token, address owner, address spender) external nonpayable returns (int64 responseCode, uint256 allowance)
```

Returns the amount which spender is still allowed to withdraw from owner. Only Applicable to Fungible Tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The Hedera token address to check the allowance of |
| owner | address | the owner of the tokens to be spent |
| spender | address | the spender of the tokens |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| allowance | uint256 | The amount which spender is still allowed to withdraw from owner. |

### approve

```solidity
function approve(address token, address spender, uint256 amount) external nonpayable returns (int64 responseCode)
```

Allows spender to withdraw from your account multiple times, up to the value amount. If this function is called again it overwrites the current allowance with value. Only Applicable to Fungible Tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The hedera token address to approve |
| spender | address | the account address authorized to spend |
| amount | uint256 | the amount of tokens authorized to spend. |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### approveNFT

```solidity
function approveNFT(address token, address approved, uint256 serialNumber) external nonpayable returns (int64 responseCode)
```

Allow or reaffirm the approved address to transfer an NFT the approved address does not own. Only Applicable to NFT Tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The Hedera NFT token address to approve |
| approved | address | The new approved NFT controller.  To revoke approvals pass in the zero address. |
| serialNumber | uint256 | The NFT serial number  to approve |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### associateToken

```solidity
function associateToken(address account, address token) external nonpayable returns (int64 responseCode)
```

Single-token variant of associateTokens. Will be mapped to a single entry array call of associateTokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to be associated with the provided token |
| token | address | The token to be associated with the provided account |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### associateTokens

```solidity
function associateTokens(address account, address[] tokens) external nonpayable returns (int64 responseCode)
```

Associates the provided account with the provided tokens. Must be signed by the provided  Account&#39;s key or called from the accounts contract key  If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID.  If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED.  If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF.  If any of the provided tokens has been deleted, the transaction will resolve to TOKEN_WAS_DELETED.  If an association between the provided account and any of the tokens already exists, the  transaction will resolve to TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT.  If the provided account&#39;s associations count exceed the constraint of maximum token associations    per account, the transaction will resolve to TOKENS_PER_ACCOUNT_LIMIT_EXCEEDED.  On success, associations between the provided account and tokens are made and the account is    ready to interact with the tokens.



#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to be associated with the provided tokens |
| tokens | address[] | The tokens to be associated with the provided account. In the case of NON_FUNGIBLE_UNIQUE               Type, once an account is associated, it can hold any number of NFTs (serial numbers) of that               token type |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### burnToken

```solidity
function burnToken(address token, uint64 amount, int64[] serialNumbers) external nonpayable returns (int64 responseCode, uint64 newTotalSupply)
```

Burns an amount of the token from the defined treasury account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token for which to burn tokens. If token does not exist, transaction results in              INVALID_TOKEN_ID |
| amount | uint64 | Applicable to tokens of type FUNGIBLE_COMMON. The amount to burn from the Treasury Account.                Amount must be a positive non-zero number, not bigger than the token balance of the treasury                account (0; balance], represented in the lowest denomination. |
| serialNumbers | int64[] | Applicable to tokens of type NON_FUNGIBLE_UNIQUE. The list of serial numbers to be burned. |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| newTotalSupply | uint64 | The new supply of tokens. For NFTs it is the total count of NFTs |

### createFungibleToken

```solidity
function createFungibleToken(IHederaTokenService.HederaToken token, uint64 initialTotalSupply, uint32 decimals) external payable returns (int64 responseCode, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | IHederaTokenService.HederaToken | undefined |
| initialTotalSupply | uint64 | undefined |
| decimals | uint32 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |
| tokenAddress | address | undefined |

### createFungibleTokenWithCustomFees

```solidity
function createFungibleTokenWithCustomFees(IHederaTokenService.HederaToken token, uint64 initialTotalSupply, uint32 decimals, IHederaTokenService.FixedFee[] fixedFees, IHederaTokenService.FractionalFee[] fractionalFees) external payable returns (int64 responseCode, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | IHederaTokenService.HederaToken | undefined |
| initialTotalSupply | uint64 | undefined |
| decimals | uint32 | undefined |
| fixedFees | IHederaTokenService.FixedFee[] | undefined |
| fractionalFees | IHederaTokenService.FractionalFee[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |
| tokenAddress | address | undefined |

### createNonFungibleToken

```solidity
function createNonFungibleToken(IHederaTokenService.HederaToken token) external payable returns (int64 responseCode, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | IHederaTokenService.HederaToken | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |
| tokenAddress | address | undefined |

### createNonFungibleTokenWithCustomFees

```solidity
function createNonFungibleTokenWithCustomFees(IHederaTokenService.HederaToken token, IHederaTokenService.FixedFee[] fixedFees, IHederaTokenService.RoyaltyFee[] royaltyFees) external payable returns (int64 responseCode, address tokenAddress)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | IHederaTokenService.HederaToken | undefined |
| fixedFees | IHederaTokenService.FixedFee[] | undefined |
| royaltyFees | IHederaTokenService.RoyaltyFee[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |
| tokenAddress | address | undefined |

### cryptoTransfer

```solidity
function cryptoTransfer(IHederaTokenService.TransferList transferList, IHederaTokenService.TokenTransferList[] tokenTransfers) external nonpayable returns (int64 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| transferList | IHederaTokenService.TransferList | undefined |
| tokenTransfers | IHederaTokenService.TokenTransferList[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### deleteToken

```solidity
function deleteToken(address token) external nonpayable returns (int64 responseCode)
```

Operation to delete token



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to be deleted |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### dissociateToken

```solidity
function dissociateToken(address account, address token) external nonpayable returns (int64 responseCode)
```

Single-token variant of dissociateTokens. Will be mapped to a single entry array call of dissociateTokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to be associated with the provided token |
| token | address | The token to be associated with the provided account |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### dissociateTokens

```solidity
function dissociateTokens(address account, address[] tokens) external nonpayable returns (int64 responseCode)
```

Dissociates the provided account with the provided tokens. Must be signed by the provided Account&#39;s key. If the provided account is not found, the transaction will resolve to INVALID_ACCOUNT_ID. If the provided account has been deleted, the transaction will resolve to ACCOUNT_DELETED. If any of the provided tokens is not found, the transaction will resolve to INVALID_TOKEN_REF. If any of the provided tokens has been deleted, the transaction will resolve to TOKEN_WAS_DELETED. If an association between the provided account and any of the tokens does not exist, the transaction will resolve to TOKEN_NOT_ASSOCIATED_TO_ACCOUNT. If a token has not been deleted and has not expired, and the user has a nonzero balance, the transaction will resolve to TRANSACTION_REQUIRES_ZERO_TOKEN_BALANCES. If a &lt;b&gt;fungible token&lt;/b&gt; has expired, the user can disassociate even if their token balance is not zero. If a &lt;b&gt;non fungible token&lt;/b&gt; has expired, the user can &lt;b&gt;not&lt;/b&gt; disassociate if their token balance is not zero. The transaction will resolve to TRANSACTION_REQUIRED_ZERO_TOKEN_BALANCES. On success, associations between the provided account and tokens are removed.



#### Parameters

| Name | Type | Description |
|---|---|---|
| account | address | The account to be dissociated from the provided tokens |
| tokens | address[] | The tokens to be dissociated from the provided account. |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### freezeToken

```solidity
function freezeToken(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to freeze token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to be frozen |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### getApproved

```solidity
function getApproved(address token, uint256 serialNumber) external nonpayable returns (int64 responseCode, address approved)
```

Get the approved address for a single NFT Only Applicable to NFT Tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The Hedera NFT token address to check approval |
| serialNumber | uint256 | The NFT to find the approved address for |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| approved | address | The approved address for this NFT, or the zero address if there is none |

### getFungibleTokenInfo

```solidity
function getFungibleTokenInfo(address token) external nonpayable returns (int64 responseCode, struct IHederaTokenService.FungibleTokenInfo fungibleTokenInfo)
```

Query fungible token info



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| fungibleTokenInfo | IHederaTokenService.FungibleTokenInfo | FungibleTokenInfo info for `token` |

### getNonFungibleTokenInfo

```solidity
function getNonFungibleTokenInfo(address token, int64 serialNumber) external nonpayable returns (int64 responseCode, struct IHederaTokenService.NonFungibleTokenInfo nonFungibleTokenInfo)
```

Query non fungible token info



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| serialNumber | int64 | The NFT serialNumber to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| nonFungibleTokenInfo | IHederaTokenService.NonFungibleTokenInfo | NonFungibleTokenInfo info for `token` `serialNumber` |

### getTokenCustomFees

```solidity
function getTokenCustomFees(address token) external nonpayable returns (int64 responseCode, struct IHederaTokenService.FixedFee[] fixedFees, struct IHederaTokenService.FractionalFee[] fractionalFees, struct IHederaTokenService.RoyaltyFee[] royaltyFees)
```

Query token custom fees



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| fixedFees | IHederaTokenService.FixedFee[] | Set of fixed fees for `token` |
| fractionalFees | IHederaTokenService.FractionalFee[] | Set of fractional fees for `token` |
| royaltyFees | IHederaTokenService.RoyaltyFee[] | Set of royalty fees for `token` |

### getTokenDefaultFreezeStatus

```solidity
function getTokenDefaultFreezeStatus(address token) external nonpayable returns (int64 responseCode, bool defaultFreezeStatus)
```

Query token default freeze status



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| defaultFreezeStatus | bool | True if `token` default freeze status is frozen. |

### getTokenDefaultKycStatus

```solidity
function getTokenDefaultKycStatus(address token) external nonpayable returns (int64 responseCode, bool defaultKycStatus)
```

Query token default kyc status



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| defaultKycStatus | bool | True if `token` default kyc status is KycNotApplicable and false if Revoked. |

### getTokenExpiryInfo

```solidity
function getTokenExpiryInfo(address token) external nonpayable returns (int64 responseCode, struct IHederaTokenService.Expiry expiry)
```

Query token expiry info



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| expiry | IHederaTokenService.Expiry | Expiry info for `token` |

### getTokenInfo

```solidity
function getTokenInfo(address token) external nonpayable returns (int64 responseCode, struct IHederaTokenService.TokenInfo tokenInfo)
```

Query token info



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| tokenInfo | IHederaTokenService.TokenInfo | TokenInfo info for `token` |

### getTokenKey

```solidity
function getTokenKey(address token, uint256 keyType) external nonpayable returns (int64 responseCode, struct IHederaTokenService.KeyValue key)
```

Query token KeyValue



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| keyType | uint256 | The keyType of the desired KeyValue |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| key | IHederaTokenService.KeyValue | KeyValue info for key of type `keyType` |

### getTokenType

```solidity
function getTokenType(address token) external nonpayable returns (int64 responseCode, int32 tokenType)
```

Query to return the token type for a given address



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| tokenType | int32 | the token type. 0 is FUNGIBLE_COMMON, 1 is NON_FUNGIBLE_UNIQUE, -1 is UNRECOGNIZED |

### grantTokenKyc

```solidity
function grantTokenKyc(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to grant kyc to token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to grant kyc |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### isApprovedForAll

```solidity
function isApprovedForAll(address token, address owner, address operator) external nonpayable returns (int64 responseCode, bool approved)
```

Query if an address is an authorized operator for another address Only Applicable to NFT Tokens



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The Hedera NFT token address to approve |
| owner | address | The address that owns the NFTs |
| operator | address | The address that acts on behalf of the owner |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| approved | bool | True if `operator` is an approved operator for `owner`, false otherwise |

### isFrozen

```solidity
function isFrozen(address token, address account) external nonpayable returns (int64 responseCode, bool frozen)
```

Query if token account is frozen



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| account | address | The account address associated with the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| frozen | bool | True if `account` is frozen for `token` |

### isKyc

```solidity
function isKyc(address token, address account) external nonpayable returns (int64 responseCode, bool kycGranted)
```

Query if token account has kyc granted



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to check |
| account | address | The account address associated with the token |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| kycGranted | bool | True if `account` has kyc granted for `token` |

### isToken

```solidity
function isToken(address token) external nonpayable returns (int64 responseCode, bool isToken)
```

Query if valid token found for the given address



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| isToken | bool | True if valid token found for the given address |

### mintToken

```solidity
function mintToken(address token, uint64 amount, bytes[] metadata) external nonpayable returns (int64 responseCode, uint64 newTotalSupply, int64[] serialNumbers)
```

Mints an amount of the token to the defined treasury account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token for which to mint tokens. If token does not exist, transaction results in              INVALID_TOKEN_ID |
| amount | uint64 | Applicable to tokens of type FUNGIBLE_COMMON. The amount to mint to the Treasury Account.               Amount must be a positive non-zero number represented in the lowest denomination of the               token. The new supply must be lower than 2^63. |
| metadata | bytes[] | Applicable to tokens of type NON_FUNGIBLE_UNIQUE. A list of metadata that are being created.                 Maximum allowed size of each metadata is 100 bytes |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |
| newTotalSupply | uint64 | The new supply of tokens. For NFTs it is the total count of NFTs |
| serialNumbers | int64[] | If the token is an NFT the newly generate serial numbers, othersise empty. |

### pauseToken

```solidity
function pauseToken(address token) external nonpayable returns (int64 responseCode)
```

Operation to pause token



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to be paused |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### revokeTokenKyc

```solidity
function revokeTokenKyc(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to revoke kyc to token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to revoke kyc |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### setApprovalForAll

```solidity
function setApprovalForAll(address token, address operator, bool approved) external nonpayable returns (int64 responseCode)
```

Enable or disable approval for a third party (&quot;operator&quot;) to manage  all of `msg.sender`&#39;s assets



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The Hedera NFT token address to approve |
| operator | address | Address to add to the set of authorized operators |
| approved | bool | True if the operator is approved, false to revoke approval |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

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

### transferNFT

```solidity
function transferNFT(address token, address sender, address recipient, int64 serialNumber) external nonpayable returns (int64 responseCode)
```

Transfers tokens where the calling account/contract is implicitly the first entry in the token transfer list, where the amount is the value needed to zero balance the transfers. Regular signing rules apply for sending (positive amount) or receiving (negative amount)



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token to transfer to/from |
| sender | address | The sender for the transaction |
| recipient | address | The receiver of the transaction |
| serialNumber | int64 | The serial number of the NFT to transfer. |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### transferNFTs

```solidity
function transferNFTs(address token, address[] sender, address[] receiver, int64[] serialNumber) external nonpayable returns (int64 responseCode)
```

Initiates a Non-Fungable Token Transfer



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The ID of the token as a solidity address |
| sender | address[] | the sender of an nft |
| receiver | address[] | the receiver of the nft sent by the same index at sender |
| serialNumber | int64[] | the serial number of the nft sent by the same index at sender |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### transferToken

```solidity
function transferToken(address token, address sender, address recipient, int64 amount) external nonpayable returns (int64 responseCode)
```

Transfers tokens where the calling account/contract is implicitly the first entry in the token transfer list, where the amount is the value needed to zero balance the transfers. Regular signing rules apply for sending (positive amount) or receiving (negative amount)



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token to transfer to/from |
| sender | address | The sender for the transaction |
| recipient | address | The receiver of the transaction |
| amount | int64 | Non-negative value to send. a negative value will result in a failure. |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### transferTokens

```solidity
function transferTokens(address token, address[] accountId, int64[] amount) external nonpayable returns (int64 responseCode)
```

Initiates a Fungible Token Transfer



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The ID of the token as a solidity address |
| accountId | address[] | account to do a transfer to/from |
| amount | int64[] | The amount from the accountId at the same index |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### unfreezeToken

```solidity
function unfreezeToken(address token, address account) external nonpayable returns (int64 responseCode)
```

Operation to unfreeze token account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to be unfrozen |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### unpauseToken

```solidity
function unpauseToken(address token) external nonpayable returns (int64 responseCode)
```

Operation to unpause token



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address to be unpaused |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### updateTokenExpiryInfo

```solidity
function updateTokenExpiryInfo(address token, IHederaTokenService.Expiry expiryInfo) external nonpayable returns (int64 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| expiryInfo | IHederaTokenService.Expiry | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### updateTokenInfo

```solidity
function updateTokenInfo(address token, IHederaTokenService.HederaToken tokenInfo) external nonpayable returns (int64 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| tokenInfo | IHederaTokenService.HederaToken | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### updateTokenKeys

```solidity
function updateTokenKeys(address token, IHederaTokenService.TokenKey[] keys) external nonpayable returns (int64 responseCode)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | undefined |
| keys | IHederaTokenService.TokenKey[] | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | undefined |

### wipeTokenAccount

```solidity
function wipeTokenAccount(address token, address account, uint32 amount) external nonpayable returns (int64 responseCode)
```

Operation to wipe fungible tokens from account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to revoke kyc |
| amount | uint32 | The number of tokens to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |

### wipeTokenAccountNFT

```solidity
function wipeTokenAccountNFT(address token, address account, int64[] serialNumbers) external nonpayable returns (int64 responseCode)
```

Operation to wipe non fungible tokens from account



#### Parameters

| Name | Type | Description |
|---|---|---|
| token | address | The token address |
| account | address | The account address to revoke kyc |
| serialNumbers | int64[] | The serial numbers of token to wipe |

#### Returns

| Name | Type | Description |
|---|---|---|
| responseCode | int64 | The response code for the status of the request. SUCCESS is 22. |




