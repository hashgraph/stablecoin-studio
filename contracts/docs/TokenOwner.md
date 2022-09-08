# TokenOwner









## Methods

### getTokenAddress

```solidity
function getTokenAddress() external view returns (address)
```



*Returns the address token. *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address token. |

### getTokenOwnerAddress

```solidity
function getTokenOwnerAddress() external view returns (address)
```



*Returns the address HTSTokenOwner. *


#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | The address HTSTokenOwner. |

### setTokenAddress

```solidity
function setTokenAddress(contract HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external nonpayable
```



*Assigns the address contract HTSTokenOwner and the address of the token. Validating that the token address is not already assigned*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _htsTokenOwnerAddress | contract HTSTokenOwner | The address contract HTSTokenOwner |
| _tokenAddress | address | The address token created |




