# TokenOwner









## Methods

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

### setTokenAddress

```solidity
function setTokenAddress(contract HTSTokenOwner _htsTokenOwnerAddress, address _tokenAddress) external nonpayable
```



*Assigns the HTSTokenOwner contract address and the token address, validating that the token address was not already assigned*

#### Parameters

| Name | Type | Description |
|---|---|---|
| _htsTokenOwnerAddress | contract HTSTokenOwner | The  contract address HTSTokenOwner |
| _tokenAddress | address | The token address created |




