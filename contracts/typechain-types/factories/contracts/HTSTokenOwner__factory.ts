/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  HTSTokenOwner,
  HTSTokenOwnerInterface,
} from "../../contracts/HTSTokenOwner";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burnToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "erc20address",
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
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getTokenExpiryInfo",
    outputs: [
      {
        internalType: "int256",
        name: "responseCode",
        type: "int256",
      },
      {
        components: [
          {
            internalType: "uint32",
            name: "second",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "autoRenewAccount",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "autoRenewPeriod",
            type: "uint32",
          },
        ],
        internalType: "struct IHederaTokenService.Expiry",
        name: "expiryInfo",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "keyType",
        type: "uint256",
      },
    ],
    name: "getTokenKey",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        components: [
          {
            internalType: "bool",
            name: "inheritAccountKey",
            type: "bool",
          },
          {
            internalType: "address",
            name: "contractId",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "ed25519",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "ECDSA_secp256k1",
            type: "bytes",
          },
          {
            internalType: "address",
            name: "delegatableContractId",
            type: "address",
          },
        ],
        internalType: "struct IHederaTokenService.KeyValue",
        name: "key",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "grantTokenKyc",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isKyc",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
      {
        internalType: "bool",
        name: "kycGranted",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mintToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "pauseToken",
    outputs: [
      {
        internalType: "int256",
        name: "responseCode",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "revokeTokenKyc",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_erc20address",
        type: "address",
      },
    ],
    name: "setERC20Address",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "toString",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "tranferContract",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "unpauseToken",
    outputs: [
      {
        internalType: "int256",
        name: "responseCode",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint32",
            name: "second",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "autoRenewAccount",
            type: "address",
          },
          {
            internalType: "uint32",
            name: "autoRenewPeriod",
            type: "uint32",
          },
        ],
        internalType: "struct IHederaTokenService.Expiry",
        name: "expiryInfo",
        type: "tuple",
      },
    ],
    name: "updateTokenExpiryInfo",
    outputs: [
      {
        internalType: "int256",
        name: "responseCode",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        components: [
          {
            internalType: "uint256",
            name: "keyType",
            type: "uint256",
          },
          {
            components: [
              {
                internalType: "bool",
                name: "inheritAccountKey",
                type: "bool",
              },
              {
                internalType: "address",
                name: "contractId",
                type: "address",
              },
              {
                internalType: "bytes",
                name: "ed25519",
                type: "bytes",
              },
              {
                internalType: "bytes",
                name: "ECDSA_secp256k1",
                type: "bytes",
              },
              {
                internalType: "address",
                name: "delegatableContractId",
                type: "address",
              },
            ],
            internalType: "struct IHederaTokenService.KeyValue",
            name: "key",
            type: "tuple",
          },
        ],
        internalType: "struct IHederaTokenService.TokenKey[]",
        name: "keys",
        type: "tuple[]",
      },
    ],
    name: "updateTokenKeys",
    outputs: [
      {
        internalType: "int64",
        name: "responseCode",
        type: "int64",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "amount",
        type: "uint32",
      },
    ],
    name: "wipeToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50611d07806100206000396000f3fe608060405234801561001057600080fd5b50600436106100f65760003560e01c80638f8d7f99116100925780638f8d7f9914610206578063af99c63314610219578063beabacc81461022c578063d1df306c1461023f578063d4e2b89614610252578063d614cdb814610265578063e192545a14610286578063f18d03cc14610299578063f2c31ff4146102ac57600080fd5b80633b3bff0f146100fb5780633c4dd32e1461012157806341bec0d214610142578063593d6e82146101575780636a83b7e91461016a5780636fc3cbaf1461018a57806371aad10d146101b057806379c65068146101d05780637c41ad2c146101f3575b600080fd5b61010e6101093660046110f2565b6102d9565b6040519081526020015b60405180910390f35b61013461012f36600461110f565b6103b3565b604051610118929190611201565b6101556101503660046110f2565b61049a565b005b61010e6101653660046112e9565b61051a565b60005461017d906001600160a01b031681565b6040516101189190611366565b61019d610198366004611428565b6105f7565b60405160079190910b8152602001610118565b6101c36101be3660046115c4565b610623565b60405161011891906115f8565b6101e36101de36600461110f565b61083b565b6040519015158152602001610118565b61010e6102013660046110f2565b6108c2565b61019d61021436600461160b565b6108ec565b61019d61022736600461160b565b610918565b6101e361023a366004611644565b610944565b6101e361024d36600461110f565b610995565b6101e3610260366004611685565b6109f5565b6102786102733660046110f2565b610a38565b6040516101189291906116fb565b6101e3610294366004611644565b610b57565b6101e36102a736600461170f565b610b90565b6102bf6102ba36600461160b565b610bd4565b6040805160079390930b8352901515602083015201610118565b60008060006101676001600160a01b0316633b3bff0f60e01b856040516024016103039190611366565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516103419190611760565b6000604051808303816000865af19150503d806000811461037e576040519150601f19603f3d011682016040523d82523d6000602084013e610383565b606091505b5091509150816103945760156103a8565b808060200190518101906103a8919061178e565b60030b949350505050565b60006103bd611087565b604080516001600160a01b0386166024820152604480820186905282518083039091018152606490910182526020810180516001600160e01b0316631e26e99760e11b179052905160009182916101679161041791611760565b6000604051808303816000865af19150503d8060008114610454576040519150601f19603f3d011682016040523d82523d6000602084013e610459565b606091505b5091509150610466611087565b8261047357601581610487565b8180602001905181019061048791906117f9565b60039190910b9890975095505050505050565b6000546001600160a01b0316156104f85760405162461bcd60e51b815260206004820152601d60248201527f4552433230206164647265737320616c726561647920646566696e656400000060448201526064015b60405180910390fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b60008060006101676001600160a01b031663593d6e8260e01b86866040516024016105469291906118d3565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516105849190611760565b6000604051808303816000865af19150503d80600081146105c1576040519150601f19603f3d011682016040523d82523d6000602084013e6105c6565b606091505b5091509150816105d75760156105eb565b808060200190518101906105eb919061178e565b60030b95945050505050565b60008060006101676001600160a01b0316636fc3cbaf60e01b86866040516024016105469291906118f0565b60408051808201909152601081526f181899199a1a9b1b9c1cb0b131b232b360811b602082015281516060919060009061065e90600261198b565b6106699060026119aa565b6001600160401b0381111561068057610680611225565b6040519080825280601f01601f1916602001820160405280156106aa576020820181803683370190505b509050600360fc1b816000815181106106c5576106c56119c2565b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106106f4576106f46119c2565b60200101906001600160f81b031916908160001a90535060005b84518110156108335782600486838151811061072c5761072c6119c2565b016020015182516001600160f81b031990911690911c60f81c908110610754576107546119c2565b01602001516001600160f81b0319168261076f83600261198b565b61077a9060026119aa565b8151811061078a5761078a6119c2565b60200101906001600160f81b031916908160001a905350828582815181106107b4576107b46119c2565b602091010151815160f89190911c600f169081106107d4576107d46119c2565b01602001516001600160f81b031916826107ef83600261198b565b6107fa9060036119aa565b8151811061080a5761080a6119c2565b60200101906001600160f81b031916908160001a9053508061082b816119d8565b91505061070e565b509392505050565b600080546001600160a01b031633146108665760405162461bcd60e51b81526004016104ef906119f3565b600080806108a98686836040519080825280602002602001820160405280156108a357816020015b606081526020019060019003908161088e5790505b50610ca8565b9250925092506108b883610da6565b9695505050505050565b60008060006101676001600160a01b0316637c41ad2c60e01b856040516024016103039190611366565b60008060006101676001600160a01b0316638f8d7f9960e01b8686604051602401610546929190611a35565b60008060006101676001600160a01b031663af99c63360e01b8686604051602401610546929190611a35565b600080546001600160a01b0316331461096f5760405162461bcd60e51b81526004016104ef906119f3565b83600061097e82308787610de8565b905061098981610da6565b925050505b9392505050565b600080546001600160a01b031633146109c05760405162461bcd60e51b81526004016104ef906119f3565b6040805160008082526020820190925281906109df9086908690610ed0565b915091506109ec82610da6565b95945050505050565b600080546001600160a01b03163314610a205760405162461bcd60e51b81526004016104ef906119f3565b6000610a2d858585610fa6565b90506109ec81610da6565b604080516060810182526000808252602082018190529181018290526000806101676001600160a01b031663d614cdb860e01b86604051602401610a7c9190611366565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610aba9190611760565b6000604051808303816000865af19150503d8060008114610af7576040519150601f19603f3d011682016040523d82523d6000602084013e610afc565b606091505b5091509150610b24604080516060810182526000808252602082018190529181019190915290565b82610b3157601581610b45565b81806020019051810190610b459190611a4f565b60039190910b97909650945050505050565b600080546001600160a01b03163314610b825760405162461bcd60e51b81526004016104ef906119f3565b6000610a2d85308686610de8565b600080546001600160a01b03163314610bbb5760405162461bcd60e51b81526004016104ef906119f3565b6000610bc986868686610de8565b90506108b881610da6565b6000806000806101676001600160a01b031663f2c31ff460e01b8787604051602401610c01929190611a35565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610c3f9190611760565b6000604051808303816000865af19150503d8060008114610c7c576040519150601f19603f3d011682016040523d82523d6000602084013e610c81565b606091505b509150915081610c945760156000610b45565b80806020019051810190610b459190611aba565b60008060606000806101676001600160a01b031663278e0b8860e01b898989604051602401610cd993929190611ae6565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610d179190611760565b6000604051808303816000865af19150503d8060008114610d54576040519150601f19603f3d011682016040523d82523d6000602084013e610d59565b606091505b509150915081610d7c576040805160008082526020820190925260159190610d90565b80806020019051810190610d909190611b70565b60039290920b9a90995090975095505050505050565b600060168214610de05760405162461bcd60e51b815260206004820152600560248201526422b93937b960d91b60448201526064016104ef565b506001919050565b604080516001600160a01b038681166024830152858116604483015284166064820152600783900b6084808301919091528251808303909101815260a490910182526020810180516001600160e01b031663eca3691760e01b17905290516000918291829161016791610e5b9190611760565b6000604051808303816000865af19150503d8060008114610e98576040519150601f19603f3d011682016040523d82523d6000602084013e610e9d565b606091505b509150915081610eae576015610ec2565b80806020019051810190610ec2919061178e565b60030b979650505050505050565b6000806000806101676001600160a01b031663acb9cff960e01b888888604051602401610eff93929190611c33565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610f3d9190611760565b6000604051808303816000865af19150503d8060008114610f7a576040519150601f19603f3d011682016040523d82523d6000602084013e610f7f565b606091505b509150915081610f925760156000610487565b808060200190518101906104879190611c9e565b604080516001600160a01b0385811660248301528416604482015263ffffffff831660648083019190915282518083039091018152608490910182526020810180516001600160e01b0316639790686d60e01b179052905160009182918291610167916110139190611760565b6000604051808303816000865af19150503d8060008114611050576040519150601f19603f3d011682016040523d82523d6000602084013e611055565b606091505b50915091508161106657601561107a565b8080602001905181019061107a919061178e565b60030b9695505050505050565b6040518060a0016040528060001515815260200160006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681525090565b6001600160a01b03811681146110df57600080fd5b50565b80356110ed816110ca565b919050565b60006020828403121561110457600080fd5b813561098e816110ca565b6000806040838503121561112257600080fd5b823561112d816110ca565b946020939093013593505050565b60005b8381101561115657818101518382015260200161113e565b83811115611165576000848401525b50505050565b6000815180845261118381602086016020860161113b565b601f01601f19169290920160200192915050565b8051151582526000602082015160018060a01b0380821660208601526040840151915060a060408601526111ce60a086018361116b565b9150606084015185830360608701526111e7838261116b565b925050806080850151166080860152508091505092915050565b8260070b815260406020820152600061121d6040830184611197565b949350505050565b634e487b7160e01b600052604160045260246000fd5b604051606081016001600160401b038111828210171561125d5761125d611225565b60405290565b604080519081016001600160401b038111828210171561125d5761125d611225565b60405160a081016001600160401b038111828210171561125d5761125d611225565b604051601f8201601f191681016001600160401b03811182821017156112cf576112cf611225565b604052919050565b63ffffffff811681146110df57600080fd5b60008082840360808112156112fd57600080fd5b8335611308816110ca565b92506060601f198201121561131c57600080fd5b5061132561123b565b6020840135611333816112d7565b81526040840135611343816110ca565b60208201526060840135611356816112d7565b6040820152919491935090915050565b6001600160a01b0391909116815260200190565b60006001600160401b0382111561139357611393611225565b5060051b60200190565b80151581146110df57600080fd5b60006001600160401b038211156113c4576113c4611225565b50601f01601f191660200190565b600082601f8301126113e357600080fd5b81356113f66113f1826113ab565b6112a7565b81815284602083860101111561140b57600080fd5b816020850160208301376000918101602001919091529392505050565b6000806040838503121561143b57600080fd5b61144583356110ca565b8235915060208301356001600160401b038082111561146357600080fd5b818501915085601f83011261147757600080fd5b6114846113f1833561137a565b82358082526020808301929160051b850101888111156114a357600080fd5b602085015b818110156115b55784813511156114be57600080fd5b80358601601f196040828d03820112156114d757600080fd5b6114df611263565b602083013581526040830135888111156114f857600080fd5b929092019160a0838e038301121561150f57600080fd5b611517611285565b915060208301356115278161139d565b82526040830135611537816110ca565b602083015260608301358881111561154e57600080fd5b61155d8e6020838701016113d2565b60408401525060808301358881111561157557600080fd5b6115848e6020838701016113d2565b60608401525061159660a084016110e2565b60808301526020818101929092528652948501949190910190506114a8565b50959890975095505050505050565b6000602082840312156115d657600080fd5b81356001600160401b038111156115ec57600080fd5b61121d848285016113d2565b60208152600061098e602083018461116b565b6000806040838503121561161e57600080fd5b8235611629816110ca565b91506020830135611639816110ca565b809150509250929050565b60008060006060848603121561165957600080fd5b8335611664816110ca565b92506020840135611674816110ca565b929592945050506040919091013590565b60008060006060848603121561169a57600080fd5b83356116a5816110ca565b925060208401356116b5816110ca565b915060408401356116c5816112d7565b809150509250925092565b805163ffffffff90811683526020808301516001600160a01b03169084015260409182015116910152565b8281526080810161098e60208301846116d0565b6000806000806080858703121561172557600080fd5b8435611730816110ca565b93506020850135611740816110ca565b92506040850135611750816110ca565b9396929550929360600135925050565b6000825161177281846020870161113b565b9190910192915050565b8051600381900b81146110ed57600080fd5b6000602082840312156117a057600080fd5b61098e8261177c565b80516110ed816110ca565b600082601f8301126117c557600080fd5b81516117d36113f1826113ab565b8181528460208386010111156117e857600080fd5b61121d82602083016020870161113b565b6000806040838503121561180c57600080fd5b6118158361177c565b915060208301516001600160401b038082111561183157600080fd5b9084019060a0828703121561184557600080fd5b61184d611285565b82516118588161139d565b81526020830151611868816110ca565b602082015260408301518281111561187f57600080fd5b61188b888286016117b4565b6040830152506060830151828111156118a357600080fd5b6118af888286016117b4565b6060830152506118c1608084016117a9565b60808201528093505050509250929050565b6001600160a01b03831681526080810161098e60208301846116d0565b6001600160a01b0383168152604060208083018290528351828401819052600092916060600583901b860181019290860190878301865b8281101561196657888603605f1901845281518051875285015185870188905261195388880182611197565b9650509284019290840190600101611927565b50939998505050505050505050565b634e487b7160e01b600052601160045260246000fd5b60008160001904831182151516156119a5576119a5611975565b500290565b600082198211156119bd576119bd611975565b500190565b634e487b7160e01b600052603260045260246000fd5b60006000198214156119ec576119ec611975565b5060010190565b60208082526022908201527f43616c6c6572206973206e6f7420486564657261455243323020636f6e74726160408201526118dd60f21b606082015260800190565b6001600160a01b0392831681529116602082015260400190565b6000808284036080811215611a6357600080fd5b611a6c8461177c565b92506060601f1982011215611a8057600080fd5b50611a8961123b565b6020840151611a97816112d7565b81526040840151611aa7816110ca565b60208201526060840151611356816112d7565b60008060408385031215611acd57600080fd5b611ad68361177c565b915060208301516116398161139d565b60006060820160018060a01b038616835260206001600160401b038616818501526060604085015281855180845260808601915060808160051b870101935082870160005b8281101561196657607f19888703018452611b4786835161116b565b95509284019290840190600101611b2b565b80516001600160401b03811681146110ed57600080fd5b600080600060608486031215611b8557600080fd5b611b8e8461177c565b92506020611b9d818601611b59565b925060408501516001600160401b03811115611bb857600080fd5b8501601f81018713611bc957600080fd5b8051611bd76113f18261137a565b81815260059190911b82018301908381019089831115611bf657600080fd5b928401925b82841015611c245783518060070b8114611c155760008081fd5b82529284019290840190611bfb565b80955050505050509250925092565b6001600160a01b03841681526001600160401b0383166020808301919091526060604083018190528351908301819052600091848101916080850190845b81811015611c9057845160070b83529383019391830191600101611c71565b509098975050505050505050565b60008060408385031215611cb157600080fd5b611cba8361177c565b9150611cc860208401611b59565b9050925092905056fea264697066735822122084ba363bb7af951fe2a0d0f3aa87aae11b3ec21ed6f3550740b23398c79509cb64736f6c634300080a0033";

type HTSTokenOwnerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: HTSTokenOwnerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class HTSTokenOwner__factory extends ContractFactory {
  constructor(...args: HTSTokenOwnerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<HTSTokenOwner> {
    return super.deploy(overrides || {}) as Promise<HTSTokenOwner>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): HTSTokenOwner {
    return super.attach(address) as HTSTokenOwner;
  }
  override connect(signer: Signer): HTSTokenOwner__factory {
    return super.connect(signer) as HTSTokenOwner__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): HTSTokenOwnerInterface {
    return new utils.Interface(_abi) as HTSTokenOwnerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): HTSTokenOwner {
    return new Contract(address, _abi, signerOrProvider) as HTSTokenOwner;
  }
}
