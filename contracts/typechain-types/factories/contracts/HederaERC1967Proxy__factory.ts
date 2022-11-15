/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  PayableOverrides,
  BytesLike,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  HederaERC1967Proxy,
  HederaERC1967ProxyInterface,
} from "../../contracts/HederaERC1967Proxy";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_logic",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    stateMutability: "payable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address",
      },
    ],
    name: "BeaconUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "getImplementation",
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
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x608060405260405161079438038061079483398101604081905261002291610322565b818161003082826000610039565b5050505061043f565b6100428361006f565b60008251118061004f5750805b1561006a5761006883836100af60201b61008b1760201c565b505b505050565b610078816100db565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60606100d4838360405180606001604052806027815260200161076d602791396101ad565b9392505050565b6100ee8161022660201b6100b71760201c565b6101555760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b60648201526084015b60405180910390fd5b8061018c7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b61023560201b6100c61760201c565b80546001600160a01b0319166001600160a01b039290921691909117905550565b6060600080856001600160a01b0316856040516101ca91906103f0565b600060405180830381855af49150503d8060008114610205576040519150601f19603f3d011682016040523d82523d6000602084013e61020a565b606091505b50909250905061021c86838387610238565b9695505050505050565b6001600160a01b03163b151590565b90565b606083156102a457825161029d576001600160a01b0385163b61029d5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015260640161014c565b50816102ae565b6102ae83836102b6565b949350505050565b8151156102c65781518083602001fd5b8060405162461bcd60e51b815260040161014c919061040c565b634e487b7160e01b600052604160045260246000fd5b60005b838110156103115781810151838201526020016102f9565b838111156100685750506000910152565b6000806040838503121561033557600080fd5b82516001600160a01b038116811461034c57600080fd5b60208401519092506001600160401b038082111561036957600080fd5b818501915085601f83011261037d57600080fd5b81518181111561038f5761038f6102e0565b604051601f8201601f19908116603f011681019083821181831017156103b7576103b76102e0565b816040528281528860208487010111156103d057600080fd5b6103e18360208301602088016102f6565b80955050505050509250929050565b600082516104028184602087016102f6565b9190910192915050565b602081526000825180602084015261042b8160408501602087016102f6565b601f01601f19169190910160400192915050565b61031f8061044e6000396000f3fe6080604052600436106100225760003560e01c8063aaf10f421461003957610031565b366100315761002f61006a565b005b61002f61006a565b34801561004557600080fd5b5061004e61007c565b6040516001600160a01b03909116815260200160405180910390f35b61007a6100756100c9565b6100fc565b565b60006100866100c9565b905090565b60606100b083836040518060600160405280602781526020016102c360279139610120565b9392505050565b6001600160a01b03163b151590565b90565b60006100867f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546001600160a01b031690565b3660008037600080366000845af43d6000803e80801561011b573d6000f35b3d6000fd5b6060600080856001600160a01b03168560405161013d9190610273565b600060405180830381855af49150503d8060008114610178576040519150601f19603f3d011682016040523d82523d6000602084013e61017d565b606091505b509150915061018e86838387610198565b9695505050505050565b60608315610207578251610200576101af856100b7565b6102005760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064015b60405180910390fd5b5081610211565b6102118383610219565b949350505050565b8151156102295781518083602001fd5b8060405162461bcd60e51b81526004016101f7919061028f565b60005b8381101561025e578181015183820152602001610246565b8381111561026d576000848401525b50505050565b60008251610285818460208701610243565b9190910192915050565b60208152600082518060208401526102ae816040850160208701610243565b601f01601f1916919091016040019291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a26469706673582212208deaffbf3528e25cd3f5bbb65bcf8108451bb20abe5e541edfb3634db38f424064736f6c634300080a0033416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564";

type HederaERC1967ProxyConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HederaERC1967ProxyConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HederaERC1967Proxy__factory extends ContractFactory {
  constructor(...args: HederaERC1967ProxyConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _logic: PromiseOrValue<string>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): Promise<HederaERC1967Proxy> {
    return super.deploy(
      _logic,
      _data,
      overrides || {}
    ) as Promise<HederaERC1967Proxy>;
  }
  override getDeployTransaction(
    _logic: PromiseOrValue<string>,
    _data: PromiseOrValue<BytesLike>,
    overrides?: PayableOverrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_logic, _data, overrides || {});
  }
  override attach(address: string): HederaERC1967Proxy {
    return super.attach(address) as HederaERC1967Proxy;
  }
  override connect(signer: Signer): HederaERC1967Proxy__factory {
    return super.connect(signer) as HederaERC1967Proxy__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HederaERC1967ProxyInterface {
    return new utils.Interface(_abi) as HederaERC1967ProxyInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): HederaERC1967Proxy {
    return new Contract(address, _abi, signerOrProvider) as HederaERC1967Proxy;
  }
}
