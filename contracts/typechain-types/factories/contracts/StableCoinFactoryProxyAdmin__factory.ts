/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  StableCoinFactoryProxyAdmin,
  StableCoinFactoryProxyAdminInterface,
} from "../../contracts/StableCoinFactoryProxyAdmin";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract TransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      {
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "changeProxyAdmin",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract TransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
    ],
    name: "getProxyAdmin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract TransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
    ],
    name: "getProxyImplementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract TransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "upgrade",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract TransparentUpgradeableProxy",
        name: "proxy",
        type: "address",
      },
      {
        internalType: "address",
        name: "implementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6106a28061007e6000396000f3fe60806040526004361061006b5760003560e01c8063204e1c7a14610070578063715018a6146100a65780637eff275e146100bd5780638da5cb5b146100dd5780639623609d146100f257806399a88ec414610105578063f2fde38b14610125578063f3b7dead14610145575b600080fd5b34801561007c57600080fd5b5061009061008b36600461048e565b610165565b60405161009d91906104b2565b60405180910390f35b3480156100b257600080fd5b506100bb6101f6565b005b3480156100c957600080fd5b506100bb6100d83660046104c6565b61020a565b3480156100e957600080fd5b50610090610274565b6100bb610100366004610515565b610283565b34801561011157600080fd5b506100bb6101203660046104c6565b6102f2565b34801561013157600080fd5b506100bb61014036600461048e565b610326565b34801561015157600080fd5b5061009061016036600461048e565b6103a4565b6000806000836001600160a01b031660405161018b90635c60da1b60e01b815260040190565b600060405180830381855afa9150503d80600081146101c6576040519150601f19603f3d011682016040523d82523d6000602084013e6101cb565b606091505b5091509150816101da57600080fd5b808060200190518101906101ee91906105ea565b949350505050565b6101fe6103ca565b6102086000610429565b565b6102126103ca565b6040516308f2839760e41b81526001600160a01b03831690638f2839709061023e9084906004016104b2565b600060405180830381600087803b15801561025857600080fd5b505af115801561026c573d6000803e3d6000fd5b505050505050565b6000546001600160a01b031690565b61028b6103ca565b60405163278f794360e11b81526001600160a01b03841690634f1ef2869034906102bb9086908690600401610607565b6000604051808303818588803b1580156102d457600080fd5b505af11580156102e8573d6000803e3d6000fd5b5050505050505050565b6102fa6103ca565b604051631b2ce7f360e11b81526001600160a01b03831690633659cfe69061023e9084906004016104b2565b61032e6103ca565b6001600160a01b0381166103985760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084015b60405180910390fd5b6103a181610429565b50565b6000806000836001600160a01b031660405161018b906303e1469160e61b815260040190565b336103d3610274565b6001600160a01b0316146102085760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161038f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b03811681146103a157600080fd5b6000602082840312156104a057600080fd5b81356104ab81610479565b9392505050565b6001600160a01b0391909116815260200190565b600080604083850312156104d957600080fd5b82356104e481610479565b915060208301356104f481610479565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561052a57600080fd5b833561053581610479565b9250602084013561054581610479565b915060408401356001600160401b038082111561056157600080fd5b818601915086601f83011261057557600080fd5b813581811115610587576105876104ff565b604051601f8201601f19908116603f011681019083821181831017156105af576105af6104ff565b816040528281528960208487010111156105c857600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000602082840312156105fc57600080fd5b81516104ab81610479565b60018060a01b038316815260006020604081840152835180604085015260005b8181101561064357858101830151858201606001528201610627565b81811115610655576000606083870101525b50601f01601f19169290920160600194935050505056fea2646970667358221220b0437ed8c4e31ae70cc608d2b86ddde2fff5cd5811afc9f34bef3e84da3021a464736f6c634300080a0033";

type StableCoinFactoryProxyAdminConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StableCoinFactoryProxyAdminConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StableCoinFactoryProxyAdmin__factory extends ContractFactory {
  constructor(...args: StableCoinFactoryProxyAdminConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<StableCoinFactoryProxyAdmin> {
    return super.deploy(
      overrides || {}
    ) as Promise<StableCoinFactoryProxyAdmin>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): StableCoinFactoryProxyAdmin {
    return super.attach(address) as StableCoinFactoryProxyAdmin;
  }
  override connect(signer: Signer): StableCoinFactoryProxyAdmin__factory {
    return super.connect(signer) as StableCoinFactoryProxyAdmin__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StableCoinFactoryProxyAdminInterface {
    return new utils.Interface(_abi) as StableCoinFactoryProxyAdminInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StableCoinFactoryProxyAdmin {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as StableCoinFactoryProxyAdmin;
  }
}
