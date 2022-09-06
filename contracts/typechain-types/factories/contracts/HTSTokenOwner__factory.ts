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
  "0x608060405234801561001057600080fd5b50611ca3806100206000396000f3fe608060405234801561001057600080fd5b50600436106100eb5760003560e01c80637c41ad2c116100925780637c41ad2c146101e85780638f8d7f99146101fb578063af99c6331461020e578063d1df306c14610221578063d4e2b89614610234578063d614cdb814610247578063e192545a14610268578063f18d03cc1461027b578063f2c31ff41461028e57600080fd5b80633b3bff0f146100f05780633c4dd32e1461011657806341bec0d214610137578063593d6e821461014c5780636a83b7e91461015f5780636fc3cbaf1461017f57806371aad10d146101a557806379c65068146101c5575b600080fd5b6101036100fe36600461108e565b6102bb565b6040519081526020015b60405180910390f35b6101296101243660046110ab565b610395565b60405161010d92919061119d565b61014a61014536600461108e565b61047c565b005b61010361015a366004611285565b6104fc565b600054610172906001600160a01b031681565b60405161010d9190611302565b61019261018d3660046113c4565b6105d9565b60405160079190910b815260200161010d565b6101b86101b3366004611560565b610605565b60405161010d9190611594565b6101d86101d33660046110ab565b61081d565b604051901515815260200161010d565b6101036101f636600461108e565b6108a4565b6101926102093660046115a7565b6108ce565b61019261021c3660046115a7565b6108fa565b6101d861022f3660046110ab565b610926565b6101d86102423660046115e0565b610986565b61025a61025536600461108e565b6109d4565b60405161010d929190611656565b6101d861027636600461166a565b610af3565b6101d86102893660046116ab565b610b2c565b6102a161029c3660046115a7565b610b70565b6040805160079390930b835290151560208301520161010d565b60008060006101676001600160a01b0316633b3bff0f60e01b856040516024016102e59190611302565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b031990941693909317909252905161032391906116fc565b6000604051808303816000865af19150503d8060008114610360576040519150601f19603f3d011682016040523d82523d6000602084013e610365565b606091505b50915091508161037657601561038a565b8080602001905181019061038a919061172a565b60030b949350505050565b600061039f611023565b604080516001600160a01b0386166024820152604480820186905282518083039091018152606490910182526020810180516001600160e01b0316631e26e99760e11b17905290516000918291610167916103f9916116fc565b6000604051808303816000865af19150503d8060008114610436576040519150601f19603f3d011682016040523d82523d6000602084013e61043b565b606091505b5091509150610448611023565b8261045557601581610469565b818060200190518101906104699190611795565b60039190910b9890975095505050505050565b6000546001600160a01b0316156104da5760405162461bcd60e51b815260206004820152601d60248201527f4552433230206164647265737320616c726561647920646566696e656400000060448201526064015b60405180910390fd5b600080546001600160a01b0319166001600160a01b0392909216919091179055565b60008060006101676001600160a01b031663593d6e8260e01b868660405160240161052892919061186f565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b031990941693909317909252905161056691906116fc565b6000604051808303816000865af19150503d80600081146105a3576040519150601f19603f3d011682016040523d82523d6000602084013e6105a8565b606091505b5091509150816105b95760156105cd565b808060200190518101906105cd919061172a565b60030b95945050505050565b60008060006101676001600160a01b0316636fc3cbaf60e01b868660405160240161052892919061188c565b60408051808201909152601081526f181899199a1a9b1b9c1cb0b131b232b360811b6020820152815160609190600090610640906002611927565b61064b906002611946565b6001600160401b03811115610662576106626111c1565b6040519080825280601f01601f19166020018201604052801561068c576020820181803683370190505b509050600360fc1b816000815181106106a7576106a761195e565b60200101906001600160f81b031916908160001a905350600f60fb1b816001815181106106d6576106d661195e565b60200101906001600160f81b031916908160001a90535060005b84518110156108155782600486838151811061070e5761070e61195e565b016020015182516001600160f81b031990911690911c60f81c9081106107365761073661195e565b01602001516001600160f81b03191682610751836002611927565b61075c906002611946565b8151811061076c5761076c61195e565b60200101906001600160f81b031916908160001a905350828582815181106107965761079661195e565b602091010151815160f89190911c600f169081106107b6576107b661195e565b01602001516001600160f81b031916826107d1836002611927565b6107dc906003611946565b815181106107ec576107ec61195e565b60200101906001600160f81b031916908160001a9053508061080d81611974565b9150506106f0565b509392505050565b600080546001600160a01b031633146108485760405162461bcd60e51b81526004016104d19061198f565b6000808061088b86868360405190808252806020026020018201604052801561088557816020015b60608152602001906001900390816108705790505b50610c44565b92509250925061089a83610d42565b9695505050505050565b60008060006101676001600160a01b0316637c41ad2c60e01b856040516024016102e59190611302565b60008060006101676001600160a01b0316638f8d7f9960e01b86866040516024016105289291906119d1565b60008060006101676001600160a01b031663af99c63360e01b86866040516024016105289291906119d1565b600080546001600160a01b031633146109515760405162461bcd60e51b81526004016104d19061198f565b6040805160008082526020820190925281906109709086908690610d84565b9150915061097d82610d42565b95945050505050565b600080546001600160a01b031633146109b15760405162461bcd60e51b81526004016104d19061198f565b60006109be858585610e5a565b90506109c981610d42565b9150505b9392505050565b604080516060810182526000808252602082018190529181018290526000806101676001600160a01b031663d614cdb860e01b86604051602401610a189190611302565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610a5691906116fc565b6000604051808303816000865af19150503d8060008114610a93576040519150601f19603f3d011682016040523d82523d6000602084013e610a98565b606091505b5091509150610ac0604080516060810182526000808252602082018190529181019190915290565b82610acd57601581610ae1565b81806020019051810190610ae191906119eb565b60039190910b97909650945050505050565b600080546001600160a01b03163314610b1e5760405162461bcd60e51b81526004016104d19061198f565b60006109be85308686610f3b565b600080546001600160a01b03163314610b575760405162461bcd60e51b81526004016104d19061198f565b6000610b6586868686610f3b565b905061089a81610d42565b6000806000806101676001600160a01b031663f2c31ff460e01b8787604051602401610b9d9291906119d1565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610bdb91906116fc565b6000604051808303816000865af19150503d8060008114610c18576040519150601f19603f3d011682016040523d82523d6000602084013e610c1d565b606091505b509150915081610c305760156000610ae1565b80806020019051810190610ae19190611a56565b60008060606000806101676001600160a01b031663278e0b8860e01b898989604051602401610c7593929190611a82565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610cb391906116fc565b6000604051808303816000865af19150503d8060008114610cf0576040519150601f19603f3d011682016040523d82523d6000602084013e610cf5565b606091505b509150915081610d18576040805160008082526020820190925260159190610d2c565b80806020019051810190610d2c9190611b0c565b60039290920b9a90995090975095505050505050565b600060168214610d7c5760405162461bcd60e51b815260206004820152600560248201526422b93937b960d91b60448201526064016104d1565b506001919050565b6000806000806101676001600160a01b031663acb9cff960e01b888888604051602401610db393929190611bcf565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b0319909416939093179092529051610df191906116fc565b6000604051808303816000865af19150503d8060008114610e2e576040519150601f19603f3d011682016040523d82523d6000602084013e610e33565b606091505b509150915081610e465760156000610469565b808060200190518101906104699190611c3a565b604080516001600160a01b0385811660248301528416604482015263ffffffff831660648083019190915282518083039091018152608490910182526020810180516001600160e01b0316639790686d60e01b17905290516000918291829161016791610ec791906116fc565b6000604051808303816000865af19150503d8060008114610f04576040519150601f19603f3d011682016040523d82523d6000602084013e610f09565b606091505b509150915081610f1a576015610f2e565b80806020019051810190610f2e919061172a565b60030b9695505050505050565b604080516001600160a01b038681166024830152858116604483015284166064820152600783900b6084808301919091528251808303909101815260a490910182526020810180516001600160e01b031663eca3691760e01b17905290516000918291829161016791610fae91906116fc565b6000604051808303816000865af19150503d8060008114610feb576040519150601f19603f3d011682016040523d82523d6000602084013e610ff0565b606091505b509150915081611001576015611015565b80806020019051810190611015919061172a565b60030b979650505050505050565b6040518060a0016040528060001515815260200160006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681525090565b6001600160a01b038116811461107b57600080fd5b50565b803561108981611066565b919050565b6000602082840312156110a057600080fd5b81356109cd81611066565b600080604083850312156110be57600080fd5b82356110c981611066565b946020939093013593505050565b60005b838110156110f25781810151838201526020016110da565b83811115611101576000848401525b50505050565b6000815180845261111f8160208601602086016110d7565b601f01601f19169290920160200192915050565b8051151582526000602082015160018060a01b0380821660208601526040840151915060a0604086015261116a60a0860183611107565b9150606084015185830360608701526111838382611107565b925050806080850151166080860152508091505092915050565b8260070b81526040602082015260006111b96040830184611133565b949350505050565b634e487b7160e01b600052604160045260246000fd5b604051606081016001600160401b03811182821017156111f9576111f96111c1565b60405290565b604080519081016001600160401b03811182821017156111f9576111f96111c1565b60405160a081016001600160401b03811182821017156111f9576111f96111c1565b604051601f8201601f191681016001600160401b038111828210171561126b5761126b6111c1565b604052919050565b63ffffffff8116811461107b57600080fd5b600080828403608081121561129957600080fd5b83356112a481611066565b92506060601f19820112156112b857600080fd5b506112c16111d7565b60208401356112cf81611273565b815260408401356112df81611066565b602082015260608401356112f281611273565b6040820152919491935090915050565b6001600160a01b0391909116815260200190565b60006001600160401b0382111561132f5761132f6111c1565b5060051b60200190565b801515811461107b57600080fd5b60006001600160401b03821115611360576113606111c1565b50601f01601f191660200190565b600082601f83011261137f57600080fd5b813561139261138d82611347565b611243565b8181528460208386010111156113a757600080fd5b816020850160208301376000918101602001919091529392505050565b600080604083850312156113d757600080fd5b6113e18335611066565b8235915060208301356001600160401b03808211156113ff57600080fd5b818501915085601f83011261141357600080fd5b61142061138d8335611316565b82358082526020808301929160051b8501018881111561143f57600080fd5b602085015b8181101561155157848135111561145a57600080fd5b80358601601f196040828d038201121561147357600080fd5b61147b6111ff565b6020830135815260408301358881111561149457600080fd5b929092019160a0838e03830112156114ab57600080fd5b6114b3611221565b915060208301356114c381611339565b825260408301356114d381611066565b60208301526060830135888111156114ea57600080fd5b6114f98e60208387010161136e565b60408401525060808301358881111561151157600080fd5b6115208e60208387010161136e565b60608401525061153260a0840161107e565b6080830152602081810192909252865294850194919091019050611444565b50959890975095505050505050565b60006020828403121561157257600080fd5b81356001600160401b0381111561158857600080fd5b6111b98482850161136e565b6020815260006109cd6020830184611107565b600080604083850312156115ba57600080fd5b82356115c581611066565b915060208301356115d581611066565b809150509250929050565b6000806000606084860312156115f557600080fd5b833561160081611066565b9250602084013561161081611066565b9150604084013561162081611273565b809150509250925092565b805163ffffffff90811683526020808301516001600160a01b03169084015260409182015116910152565b828152608081016109cd602083018461162b565b60008060006060848603121561167f57600080fd5b833561168a81611066565b9250602084013561169a81611066565b929592945050506040919091013590565b600080600080608085870312156116c157600080fd5b84356116cc81611066565b935060208501356116dc81611066565b925060408501356116ec81611066565b9396929550929360600135925050565b6000825161170e8184602087016110d7565b9190910192915050565b8051600381900b811461108957600080fd5b60006020828403121561173c57600080fd5b6109cd82611718565b805161108981611066565b600082601f83011261176157600080fd5b815161176f61138d82611347565b81815284602083860101111561178457600080fd5b6111b98260208301602087016110d7565b600080604083850312156117a857600080fd5b6117b183611718565b915060208301516001600160401b03808211156117cd57600080fd5b9084019060a082870312156117e157600080fd5b6117e9611221565b82516117f481611339565b8152602083015161180481611066565b602082015260408301518281111561181b57600080fd5b61182788828601611750565b60408301525060608301518281111561183f57600080fd5b61184b88828601611750565b60608301525061185d60808401611745565b60808201528093505050509250929050565b6001600160a01b0383168152608081016109cd602083018461162b565b6001600160a01b0383168152604060208083018290528351828401819052600092916060600583901b860181019290860190878301865b8281101561190257888603605f190184528151805187528501518587018890526118ef88880182611133565b96505092840192908401906001016118c3565b50939998505050505050505050565b634e487b7160e01b600052601160045260246000fd5b600081600019048311821515161561194157611941611911565b500290565b6000821982111561195957611959611911565b500190565b634e487b7160e01b600052603260045260246000fd5b600060001982141561198857611988611911565b5060010190565b60208082526022908201527f43616c6c6572206973206e6f7420486564657261455243323020636f6e74726160408201526118dd60f21b606082015260800190565b6001600160a01b0392831681529116602082015260400190565b60008082840360808112156119ff57600080fd5b611a0884611718565b92506060601f1982011215611a1c57600080fd5b50611a256111d7565b6020840151611a3381611273565b81526040840151611a4381611066565b602082015260608401516112f281611273565b60008060408385031215611a6957600080fd5b611a7283611718565b915060208301516115d581611339565b60006060820160018060a01b038616835260206001600160401b038616818501526060604085015281855180845260808601915060808160051b870101935082870160005b8281101561190257607f19888703018452611ae3868351611107565b95509284019290840190600101611ac7565b80516001600160401b038116811461108957600080fd5b600080600060608486031215611b2157600080fd5b611b2a84611718565b92506020611b39818601611af5565b925060408501516001600160401b03811115611b5457600080fd5b8501601f81018713611b6557600080fd5b8051611b7361138d82611316565b81815260059190911b82018301908381019089831115611b9257600080fd5b928401925b82841015611bc05783518060070b8114611bb15760008081fd5b82529284019290840190611b97565b80955050505050509250925092565b6001600160a01b03841681526001600160401b0383166020808301919091526060604083018190528351908301819052600091848101916080850190845b81811015611c2c57845160070b83529383019391830191600101611c0d565b509098975050505050505050565b60008060408385031215611c4d57600080fd5b611c5683611718565b9150611c6460208401611af5565b9050925092905056fea26469706673582212202da3c8896dec2a1da3a959f78f156cc1c07e97608b90e26981bcc8f2240c2a9664736f6c634300080a0033";

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
