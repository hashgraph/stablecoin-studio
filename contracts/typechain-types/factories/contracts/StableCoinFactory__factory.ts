/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type {
  StableCoinFactory,
  StableCoinFactoryInterface,
} from "../../contracts/StableCoinFactory";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "tokenName",
            type: "string",
          },
          {
            internalType: "string",
            name: "tokenSymbol",
            type: "string",
          },
          {
            internalType: "bool",
            name: "freeze",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "supplyType",
            type: "bool",
          },
          {
            internalType: "int64",
            name: "tokenMaxSupply",
            type: "int64",
          },
          {
            internalType: "uint64",
            name: "tokenInitialSupply",
            type: "uint64",
          },
          {
            internalType: "uint32",
            name: "tokenDecimals",
            type: "uint32",
          },
          {
            internalType: "address",
            name: "autoRenewAccountAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "treasuryAddress",
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
                internalType: "bytes",
                name: "PublicKey",
                type: "bytes",
              },
              {
                internalType: "bool",
                name: "isED25519",
                type: "bool",
              },
            ],
            internalType: "struct IStableCoinFactory.KeysStruct[]",
            name: "keys",
            type: "tuple[]",
          },
        ],
        internalType: "struct IStableCoinFactory.tokenStruct",
        name: "requestedToken",
        type: "tuple",
      },
      {
        internalType: "address",
        name: "StableCoinContractAddress",
        type: "address",
      },
    ],
    name: "deployStableCoin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506125a6806100206000396000f3fe608060405260043610620000205760003560e01c8063d4ee85cc1462000025575b600080fd5b6200003c6200003636600462000830565b62000070565b604080516001600160a01b039586168152938516602085015291841683830152909216606082015290519081900360800190f35b600080600080600085905060006040516200008b906200070c565b604051809103906000f080158015620000a8573d6000803e3d6000fd5b5060405163f2fde38b60e01b81529091506001600160a01b0382169063f2fde38b90620000da90339060040162000899565b600060405180830381600087803b158015620000f557600080fd5b505af11580156200010a573d6000803e3d6000fd5b505050506000828260405162000120906200071a565b6001600160a01b03928316815291166020820152606060408201819052600090820152608001604051809103906000f08015801562000163573d6000803e3d6000fd5b50905060006200017e620001778b62000b2c565b83620002bf565b90506000826001600160a01b0316634d92ed5d34848e60a0016020810190620001a8919062000c57565b8f60c0016020810190620001bd919062000c75565b336040518663ffffffff1660e01b8152600401620001df949392919062000dac565b60206040518083038185885af1158015620001fe573d6000803e3d6000fd5b50505050506040513d601f19601f8201168201806040525081019062000225919062000ef5565b9050620002456200023f6101208d016101008e0162000f15565b620004ca565b15620002ae576040516314fdfc6960e31b81526001600160a01b0384169063a7efe348906200027990339060040162000899565b600060405180830381600087803b1580156200029457600080fd5b505af1158015620002a9573d6000803e3d6000fd5b505050505b919a92995092975095509350505050565b620002c962000728565b6000620002d683620004d7565b9050620002e26200078b565b60e08501516001600160a01b031660208201526276a7006040820152610120850151516000906001600160401b03811115620003225762000322620008ad565b6040519080825280602002602001820160405280156200035f57816020015b6200034b620007ab565b815260200190600190039081620003415790505b50905060005b866101200151518110156200043a576040518060400160405280886101200151838151811062000399576200039962000f35565b6020026020010151600001518152602001620004018961012001518481518110620003c857620003c862000f35565b602002602001015160200151898b61012001518681518110620003ef57620003ef62000f35565b602002602001015160400151620004f5565b81525082828151811062000419576200041962000f35565b60200260200101819052508080620004319062000f61565b91505062000365565b506200044562000728565b86518152602080880151908201526101008701516200046490620004ca565b620004755786610100015162000477565b855b6001600160a01b031660408083019190915260608083019590955293870151151560808083019190915287015160070b60a082015292860151151560c084015260e0830152610100820152905092915050565b6001600160a01b03161590565b6060620004ef6001600160a01b038316601462000549565b92915050565b620004ff620007c2565b62000509620007c2565b845162000525576001600160a01b038416608082015262000541565b821562000539576040810185905262000541565b606081018590525b949350505050565b606060006200055a83600262000f7f565b6200056790600262000fa1565b6001600160401b03811115620005815762000581620008ad565b6040519080825280601f01601f191660200182016040528015620005ac576020820181803683370190505b509050600360fc1b81600081518110620005ca57620005ca62000f35565b60200101906001600160f81b031916908160001a905350600f60fb1b81600181518110620005fc57620005fc62000f35565b60200101906001600160f81b031916908160001a90535060006200062284600262000f7f565b6200062f90600162000fa1565b90505b6001811115620006b1576f181899199a1a9b1b9c1cb0b131b232b360811b85600f166010811062000667576200066762000f35565b1a60f81b82828151811062000680576200068062000f35565b60200101906001600160f81b031916908160001a90535060049490941c93620006a98162000fbc565b905062000632565b508315620007055760405162461bcd60e51b815260206004820181905260248201527f537472696e67733a20686578206c656e67746820696e73756666696369656e74604482015260640160405180910390fd5b9392505050565b6107208062000fd783390190565b610e7a80620016f783390190565b604051806101200160405280606081526020016060815260200160006001600160a01b0316815260200160608152602001600015158152602001600060070b815260200160001515815260200160608152602001620007866200078b565b905290565b604080516060810182526000808252602082018190529181019190915290565b604051806040016040528060008152602001620007865b6040518060a0016040528060001515815260200160006001600160a01b03168152602001606081526020016060815260200160006001600160a01b031681525090565b6001600160a01b03811681146200081b57600080fd5b50565b80356200082b8162000805565b919050565b600080604083850312156200084457600080fd5b82356001600160401b038111156200085b57600080fd5b830161014081860312156200086f57600080fd5b91506020830135620008818162000805565b809150509250929050565b6001600160a01b03169052565b6001600160a01b0391909116815260200190565b634e487b7160e01b600052604160045260246000fd5b604051606081016001600160401b0381118282101715620008e857620008e8620008ad565b60405290565b60405161014081016001600160401b0381118282101715620008e857620008e8620008ad565b604051601f8201601f191681016001600160401b03811182821017156200093f576200093f620008ad565b604052919050565b60006001600160401b03831115620009635762000963620008ad565b62000978601f8401601f191660200162000914565b90508281528383830111156200098d57600080fd5b828260208301376000602084830101529392505050565b600082601f830112620009b657600080fd5b620007058383356020850162000947565b803580151581146200082b57600080fd5b8035600781900b81146200082b57600080fd5b80356001600160401b03811681146200082b57600080fd5b803563ffffffff811681146200082b57600080fd5b600082601f83011262000a2a57600080fd5b813560206001600160401b038083111562000a495762000a49620008ad565b8260051b62000a5a83820162000914565b938452858101830193838101908886111562000a7557600080fd5b84880192505b8583101562000b205782358481111562000a955760008081fd5b88016060818b03601f190181131562000aae5760008081fd5b62000ab8620008c3565b8783013581526040808401358881111562000ad35760008081fd5b8401603f81018e1362000ae65760008081fd5b62000af88e8b83013584840162000947565b8a8401525062000b0a838501620009c7565b9082015284525050918401919084019062000a7b565b98975050505050505050565b6000610140823603121562000b4057600080fd5b62000b4a620008ee565b82356001600160401b038082111562000b6257600080fd5b62000b7036838701620009a4565b8352602085013591508082111562000b8757600080fd5b62000b9536838701620009a4565b602084015262000ba860408601620009c7565b604084015262000bbb60608601620009c7565b606084015262000bce60808601620009d8565b608084015262000be160a08601620009eb565b60a084015262000bf460c0860162000a03565b60c084015262000c0760e086016200081e565b60e0840152610100915062000c1e8286016200081e565b828401526101209150818501358181111562000c3957600080fd5b62000c473682880162000a18565b8385015250505080915050919050565b60006020828403121562000c6a57600080fd5b6200070582620009eb565b60006020828403121562000c8857600080fd5b620007058262000a03565b6000815180845260005b8181101562000cbb5760208185018101518683018201520162000c9d565b8181111562000cce576000602083870101525b50601f01601f19169290920160200192915050565b600081518084526020808501808196508360051b8101915082860160005b8581101562000d9f57828403895281516040815186528682015191508087870152815115158187015286820151606060018060a01b03808316828a015283850151935060a09250608083818b015262000d5e60e08b018662000c93565b928601518a8403603f1901858c015292945062000d7c858462000c93565b9501511660c0989098019790975250509885019893509084019060010162000d01565b5091979650505050505050565b608081526000855161016080608085015262000dcd6101e085018362000c93565b91506020880151607f19808685030160a087015262000ded848362000c93565b935060408a0151915062000e0560c08701836200088c565b60608a01519150808685030160e087015262000e22848362000c93565b935060808a0151915061010062000e3c8188018415159052565b60a08b0151925062000e5461012088018460070b9052565b60c08b0151151561014088015260e08b0151878603830185890152925062000e7d858462000ce3565b908b0151805163ffffffff9081166101808a015260208201516001600160a01b03166101a08a01526040820151166101c0890152909450925062000ebf915050565b506001600160401b0386166020840152905063ffffffff8416604083015262000eec60608301846200088c565b95945050505050565b60006020828403121562000f0857600080fd5b8151620007058162000805565b60006020828403121562000f2857600080fd5b8135620007058162000805565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060001982141562000f785762000f7862000f4b565b5060010190565b600081600019048311821515161562000f9c5762000f9c62000f4b565b500290565b6000821982111562000fb75762000fb762000f4b565b500190565b60008162000fce5762000fce62000f4b565b50600019019056fe608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6106a28061007e6000396000f3fe60806040526004361061006b5760003560e01c8063204e1c7a14610070578063715018a6146100a65780637eff275e146100bd5780638da5cb5b146100dd5780639623609d146100f257806399a88ec414610105578063f2fde38b14610125578063f3b7dead14610145575b600080fd5b34801561007c57600080fd5b5061009061008b36600461048e565b610165565b60405161009d91906104b2565b60405180910390f35b3480156100b257600080fd5b506100bb6101f6565b005b3480156100c957600080fd5b506100bb6100d83660046104c6565b61020a565b3480156100e957600080fd5b50610090610274565b6100bb610100366004610515565b610283565b34801561011157600080fd5b506100bb6101203660046104c6565b6102f2565b34801561013157600080fd5b506100bb61014036600461048e565b610326565b34801561015157600080fd5b5061009061016036600461048e565b6103a4565b6000806000836001600160a01b031660405161018b90635c60da1b60e01b815260040190565b600060405180830381855afa9150503d80600081146101c6576040519150601f19603f3d011682016040523d82523d6000602084013e6101cb565b606091505b5091509150816101da57600080fd5b808060200190518101906101ee91906105ea565b949350505050565b6101fe6103ca565b6102086000610429565b565b6102126103ca565b6040516308f2839760e41b81526001600160a01b03831690638f2839709061023e9084906004016104b2565b600060405180830381600087803b15801561025857600080fd5b505af115801561026c573d6000803e3d6000fd5b505050505050565b6000546001600160a01b031690565b61028b6103ca565b60405163278f794360e11b81526001600160a01b03841690634f1ef2869034906102bb9086908690600401610607565b6000604051808303818588803b1580156102d457600080fd5b505af11580156102e8573d6000803e3d6000fd5b5050505050505050565b6102fa6103ca565b604051631b2ce7f360e11b81526001600160a01b03831690633659cfe69061023e9084906004016104b2565b61032e6103ca565b6001600160a01b0381166103985760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084015b60405180910390fd5b6103a181610429565b50565b6000806000836001600160a01b031660405161018b906303e1469160e61b815260040190565b336103d3610274565b6001600160a01b0316146102085760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161038f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b03811681146103a157600080fd5b6000602082840312156104a057600080fd5b81356104ab81610479565b9392505050565b6001600160a01b0391909116815260200190565b600080604083850312156104d957600080fd5b82356104e481610479565b915060208301356104f481610479565b809150509250929050565b634e487b7160e01b600052604160045260246000fd5b60008060006060848603121561052a57600080fd5b833561053581610479565b9250602084013561054581610479565b915060408401356001600160401b038082111561056157600080fd5b818601915086601f83011261057557600080fd5b813581811115610587576105876104ff565b604051601f8201601f19908116603f011681019083821181831017156105af576105af6104ff565b816040528281528960208487010111156105c857600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b6000602082840312156105fc57600080fd5b81516104ab81610479565b60018060a01b038316815260006020604081840152835180604085015260005b8181101561064357858101830151858201606001528201610627565b81811115610655576000606083870101525b50601f01601f19169290920160600194935050505056fea2646970667358221220e7912e5605459880bb0e0bdf99a5c8f16e845259690a61c536e9ebff915c5a8f64736f6c634300080a0033608060405260405162000e7a38038062000e7a833981016040819052620000269162000496565b8282828281620000398282600062000053565b506200004790508262000090565b505050505050620005c9565b6200005e83620000eb565b6000825111806200006c5750805b156200008b576200008983836200012d60201b620002601760201c565b505b505050565b7f7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f620000bb6200015c565b604080516001600160a01b03928316815291841660208301520160405180910390a1620000e88162000195565b50565b620000f6816200024a565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b606062000155838360405180606001604052806027815260200162000e5360279139620002fe565b9392505050565b60006200018660008051602062000e3383398151915260001b620003e460201b620002081760201c565b546001600160a01b0316919050565b6001600160a01b038116620002005760405162461bcd60e51b815260206004820152602660248201527f455243313936373a206e65772061646d696e20697320746865207a65726f206160448201526564647265737360d01b60648201526084015b60405180910390fd5b806200022960008051602062000e3383398151915260001b620003e460201b620002081760201c565b80546001600160a01b0319166001600160a01b039290921691909117905550565b6200026081620003e760201b6200028c1760201c565b620002c45760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401620001f7565b80620002297f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc60001b620003e460201b620002081760201c565b60606200030b84620003e7565b620003685760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401620001f7565b600080856001600160a01b03168560405162000385919062000576565b600060405180830381855af49150503d8060008114620003c2576040519150601f19603f3d011682016040523d82523d6000602084013e620003c7565b606091505b509092509050620003da828286620003f6565b9695505050505050565b90565b6001600160a01b03163b151590565b606083156200040757508162000155565b825115620004185782518084602001fd5b8160405162461bcd60e51b8152600401620001f7919062000594565b80516001600160a01b03811681146200044c57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b83811015620004845781810151838201526020016200046a565b83811115620000895750506000910152565b600080600060608486031215620004ac57600080fd5b620004b78462000434565b9250620004c76020850162000434565b60408501519092506001600160401b0380821115620004e557600080fd5b818601915086601f830112620004fa57600080fd5b8151818111156200050f576200050f62000451565b604051601f8201601f19908116603f011681019083821181831017156200053a576200053a62000451565b816040528281528960208487010111156200055457600080fd5b6200056783602083016020880162000467565b80955050505050509250925092565b600082516200058a81846020870162000467565b9190910192915050565b6020815260008251806020840152620005b581604085016020870162000467565b601f01601f19169190910160400192915050565b61085a80620005d96000396000f3fe60806040526004361061004e5760003560e01c80633659cfe6146100655780634f1ef286146100855780635c60da1b146100985780638f283970146100c9578063f851a440146100e95761005d565b3661005d5761005b6100fe565b005b61005b6100fe565b34801561007157600080fd5b5061005b6100803660046106a5565b610118565b61005b6100933660046106c0565b61015f565b3480156100a457600080fd5b506100ad6101d0565b6040516001600160a01b03909116815260200160405180910390f35b3480156100d557600080fd5b5061005b6100e43660046106a5565b61020b565b3480156100f557600080fd5b506100ad610235565b61010661029b565b61011661011161033a565b610344565b565b610120610368565b6001600160a01b0316336001600160a01b031614156101575761015481604051806020016040528060008152506000610389565b50565b6101546100fe565b610167610368565b6001600160a01b0316336001600160a01b031614156101c8576101c38383838080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525060019250610389915050565b505050565b6101c36100fe565b60006101da610368565b6001600160a01b0316336001600160a01b03161415610200576101fb61033a565b905090565b6102086100fe565b90565b610213610368565b6001600160a01b0316336001600160a01b0316141561015757610154816103b4565b600061023f610368565b6001600160a01b0316336001600160a01b03161415610200576101fb610368565b606061028583836040518060600160405280602781526020016107fe60279139610408565b9392505050565b6001600160a01b03163b151590565b6102a3610368565b6001600160a01b0316336001600160a01b031614156101165760405162461bcd60e51b815260206004820152604260248201527f5472616e73706172656e745570677261646561626c6550726f78793a2061646d60448201527f696e2063616e6e6f742066616c6c6261636b20746f2070726f78792074617267606482015261195d60f21b608482015260a4015b60405180910390fd5b60006101fb6104e3565b3660008037600080366000845af43d6000803e808015610363573d6000f35b3d6000fd5b60006000805160206107be8339815191525b546001600160a01b0316919050565b610392836104f9565b60008251118061039f5750805b156101c3576103ae8383610260565b50505050565b7f7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f6103dd610368565b604080516001600160a01b03928316815291841660208301520160405180910390a161015481610539565b60606104138461028c565b61046e5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f6044820152651b9d1c9858dd60d21b6064820152608401610331565b600080856001600160a01b031685604051610489919061076e565b600060405180830381855af49150503d80600081146104c4576040519150601f19603f3d011682016040523d82523d6000602084013e6104c9565b606091505b50915091506104d98282866105d0565b9695505050505050565b60006000805160206107de83398151915261037a565b61050281610609565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b6001600160a01b03811661059e5760405162461bcd60e51b815260206004820152602660248201527f455243313936373a206e65772061646d696e20697320746865207a65726f206160448201526564647265737360d01b6064820152608401610331565b806000805160206107be8339815191525b80546001600160a01b0319166001600160a01b039290921691909117905550565b606083156105df575081610285565b8251156105ef5782518084602001fd5b8160405162461bcd60e51b8152600401610331919061078a565b6106128161028c565b6106745760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201526c1bdd08184818dbdb9d1c9858dd609a1b6064820152608401610331565b806000805160206107de8339815191526105af565b80356001600160a01b03811681146106a057600080fd5b919050565b6000602082840312156106b757600080fd5b61028582610689565b6000806000604084860312156106d557600080fd5b6106de84610689565b925060208401356001600160401b03808211156106fa57600080fd5b818601915086601f83011261070e57600080fd5b81358181111561071d57600080fd5b87602082850101111561072f57600080fd5b6020830194508093505050509250925092565b60005b8381101561075d578181015183820152602001610745565b838111156103ae5750506000910152565b60008251610780818460208701610742565b9190910192915050565b60208152600082518060208401526107a9816040850160208701610742565b601f01601f1916919091016040019291505056feb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a264697066735822122092ceed695d0aafe29bc6f6d22d1c7078e51225a9c3982aa597f335e830fd397864736f6c634300080a0033b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a2646970667358221220bbc3fc45640c885b700da17de39217a24bf8b61e2cb244fb3157690901e822fc64736f6c634300080a0033";

type StableCoinFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StableCoinFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StableCoinFactory__factory extends ContractFactory {
  constructor(...args: StableCoinFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<StableCoinFactory> {
    return super.deploy(overrides || {}) as Promise<StableCoinFactory>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): StableCoinFactory {
    return super.attach(address) as StableCoinFactory;
  }
  override connect(signer: Signer): StableCoinFactory__factory {
    return super.connect(signer) as StableCoinFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StableCoinFactoryInterface {
    return new utils.Interface(_abi) as StableCoinFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): StableCoinFactory {
    return new Contract(address, _abi, signerOrProvider) as StableCoinFactory;
  }
}
