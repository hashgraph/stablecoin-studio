# Hashconnect

Hashconnect is a library to connect Hedera apps to wallets, similar to web3 functionality found in the Ethereum ecosystem.

The [provided demo](https://hashpack.github.io/hashconnect/) demonstrates the pairing and signing functionality. It also contains a demo wallet (testnet only) which can be used to test functionality during the alpha phase. 

**[View Demo](https://hashpack.github.io/hashconnect/)**

**[Example React Integration](https://github.com/rajatK012/hashconnectWalletConnect)**

- [Hashconnect](#hashconnect)
  - [Concepts](#concepts)
  - [Usage](#usage)
    - [Installation](#installation)
    - [Initialization](#initialization)
      - [Additional Steps to run Server-side](#additional-steps-to-run-server-side)
    - [Metadata](#metadata)
    - [Setup](#setup)
    - [Events](#events)
      - [FoundExtensionEvent](#foundextensionevent)
      - [FoundIframeEvent](#foundiframeevent)
      - [PairingEvent](#pairingevent)
      - [Acknowledge Response](#acknowledge-response)
      - [Connection Status Change](#connection-status-change)
    - [Pairing](#pairing)
      - [Pairing to extension](#pairing-to-extension)
    - [Second Time Connecting](#second-time-connecting)
    - [Disconnecting](#disconnecting)
    - [Sending Requests](#sending-requests)
      - [Send Transaction](#send-transaction)
      - [Sign](#sign)
      - [Request Additional Accounts](#request-additional-accounts)
      - [Authenticate](#authenticate)
    - [Provider/Signer](#providersigner)
      - [Get Provider](#get-provider)
      - [Get Signer](#get-signer)
        - [Usage](#usage-1)
    - [Types](#types)
      - [HashConnectTypes](#hashconnecttypes)
        - [HashConnectTypes.AppMetadata](#hashconnecttypesappmetadata)
        - [HashConnectTypes.WalletMetadata](#hashconnecttypeswalletmetadata)
        - [HashConnectTypes.InitilizationData](#hashconnecttypesinitilizationdata)
        - [HashConnectTypes.SavedPairingData](#hashconnecttypessavedpairingdata)
        - [HashConnectConnectionState](#hashconnectconnectionstate)
      - [MessageTypes](#messagetypes)
        - [MessageTypes.BaseMessage](#messagetypesbasemessage)
        - [MessageTypes.Acknowledge](#messagetypesacknowledge)
        - [MessageTypes.Rejected](#messagetypesrejected)
        - [MessageTypes.ApprovePairing](#messagetypesapprovepairing)
        - [MessageTypes.AdditionalAccountRequest](#messagetypesadditionalaccountrequest)
        - [MessageTypes.AdditionalAccountResponse](#messagetypesadditionalaccountresponse)
        - [MessageTypes.Transaction](#messagetypestransaction)
        - [MessageTypes.TransactionMetadata](#messagetypestransactionmetadata)
        - [MessageTypes.TransactionResponse](#messagetypestransactionresponse)
        - [MessageTypes.AuthenticationRequest](#messagetypesauthenticationrequest)
        - [MessageTypes.AuthenticationResponse](#messagetypesauthenticationresponse)
        - [MessageTypes.SigningRequest](#messagetypessigningrequest)
        - [MessageTypes.SigningResponse](#messagetypessigningresponse)

## Concepts

The main functionality of Hashconnect is to send Hedera transactions to a wallet to be signed and executed by a user - we assume you are familiar with the [Hedera API's and SDK's](https://docs.hedera.com/guides/docs/hedera-api) used to build these transactions.

Hashconnect uses message relay nodes to communicate between apps. These nodes use something called a **topic ID** to publish/subscribe to.


## Usage

We recommend getting familiar with how [async/await](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Async_await) works before using Hashconnect. We also **strongly** suggest using Typescript.

### Installation

```
npm i hashconnect --save
```

### Initialization

Import the library like you would any npm package

> ESM
```js
import { HashConnect } from '@hashgraph/hashconnect';
```
> CommonJS
```js
import { HashConnect } from 'hashconnect/dist/cjs/main';
```

Create a variable to hold an instance of Hashconnect, pass `true` to this to enable debug mode.

```js
let hashconnect = new HashConnect();
```

#### Additional Steps to run Server-side

1. When calling HashConnect.init(), a url must be defined in your app's metadata
```js
const appMetadata = {
    ...,
    url: "https://yourwebsite.com"
}
let initData = await this.hashconnect.init(appMetadata, "testnet", false);
```

### Metadata
You need to define some metadata so wallets can display what app is requesting an action from the user. 

```js
let appMetadata: HashConnectTypes.AppMetadata = {
    name: "DApp Example",
    description: "An example Hedera DApp",
    icon: "https://absolute.url/to/icon.png"
}
```

The url of your app is auto-populated by HashConnect to prevent spoofing.

### Setup

All you need to do is create the HashConnect object, set up events, and then call the init function with your parameters.

```js
//create the hashconnect instance
let hashconnect = new HashConnect(true);

//register events
setUpHashConnectEvents();

//initialize and use returned data
let initData = await this.hashconnect.init(appMetadata, "testnet", false);
```

The init function will return your pairing code and any previously connected pairings as an array of `SavedPairingData` [(details)](#hashconnecttypessavedpairingdata).

Make sure you register your events before calling init - as some events will fire immediately after calling init.

### Events

Events are emitted by HashConnect to let you know when a request has been fufilled.

You can listen to them by calling .on() or .once() on them. All events return [typed](#types) data.

#### FoundExtensionEvent

This event returns the metadata of the found extensions, will fire once for each extension.

```js
hashconnect.foundExtensionEvent.once((walletMetadata) => {
    //do something with metadata
})
```

#### FoundIframeEvent

If the app is embedded inside of HashPack it will fire this event. After this event is fired, it will automatically ask the user to pair and then fire a normal pairingEvent (below) with the same data a normal pairing event would fire.

#### PairingEvent

The pairing event is triggered when a user accepts a pairing. You can access the currently connected pairings from `hashconnect.hcData.savedPairings`.

```js
hashconnect.pairingEvent.once((pairingData) => {
    //do something
})
```

#### Acknowledge Response

This event returns an [Acknowledge](#messagetypesacknowledge) object. This happens after the wallet has recieved the request, generally you should consider a wallet disconnected if a request doesn't fire an acknowledgement after a few seconds and update the UI accordingly.

The object contains the ID of the message.

```js
hashconnect.acknowledgeMessageEvent.once((acknowledgeData) => {
    //do something with acknowledge response data
})
```

#### Connection Status Change

This event is fired if the connection status changes, this should only really happen if the server goes down. HashConnect will automatically try to reconnect, once reconnected this event will fire again. This returns a `HashConnectConnectionState` [(details)](#hashconnectconnectionstate) 

```js
hashconnect.connectionStatusChangeEvent.once((connectionStatus) => {
    //do something with connection status
})
```

### Pairing

User the `pairingString` to connect to HashPack - you can either display the string for the user to copy/paste into HashPack or use it to generate a QR code which they can scan. In the future, we will generate the QR for you but for now its your responsibility.

#### Pairing to extension

HashConnect has 1-click pairing with supported installed extensions. Currently the only supported wallet extension is [HashPack](https://www.hashpack.app/).

When initializing any supported wallets will return their metadata in a ```foundExtensionEvent``` [(details)](#foundextensionevent). You should take this metadata, and display buttons with the available extensions. More extensions will be supported in the future!

You should then call:

```js
hashconnect.connectToLocalWallet(pairingString, extensionMetadata);
```

And it will pop up a modal in the extension allowing the user to pair. 

### Second Time Connecting

When calling init HashConnect will automatically reconnect to any previously connected pairings. These pairings are returned in the init data [(details)](#hashconnecttypesinitilizationdata).

### Disconnecting

Call `hashconnect.disconnect(topic)` to disconnect a pairing. You can then access the new list of current pairings from `hashconnect.hcData.savedPairings`.

### Sending Requests

#### Send Transaction

This request takes two parameters, **topicID** and [Transaction](#messagetypestransaction).

```js
await hashconnect.sendTransaction(initData.topic, transaction);
```

**Example Implementation:**

```js
async sendTransaction(trans: Transaction, acctToSign: string) {     
    let transactionBytes: Uint8Array = await SigningService.signAndMakeBytes(trans);

    const transaction: MessageTypes.Transaction = {
        topic: initData.topic,
        byteArray: transactionBytes,
        metadata: {
            accountToSign: acctToSign,
            returnTransaction: false,
            hideNft: false
        }
    }

    let response = await hashconnect.sendTransaction(initData.topic, transaction)
}
```

#### Sign

This request allows you to get a signature on a generic piece of data. You can send a string or object.

```js
await hashconnect.sign(initData.topic, signingAcct, dataToSign);
```

It will return a [SigningResponse](#messagetypessigningresponse)


#### Request Additional Accounts

This request takes two parameters, **topicID** and [AdditionalAccountRequest](#messagetypesadditionalaccountrequest
). It is used to request additional accounts *after* the initial pairing.

```js
await hashconnect.requestAdditionalAccounts(initData.topic, request);
```

**Example Implementation:**

```js
async requestAdditionalAccounts(network: string) {
    let request:MessageTypes.AdditionalAccountRequest = {
        topic: initData.topic,
        network: network
    } 

    let response = await hashconnect.requestAdditionalAccounts(initData.topic, request);
}
```

#### Authenticate

This request sends an authentication response to the wallet which can be used to generate an authentication token for use with a backend system.

The expected use of this is as follows:
- generate a payload and signature on the server, this payload should contain a single-use code you can validate later
- send that payload and signature to the frontend
- send to the users wallet
- receive a new payload back along with the users signature of the new payload
- send this payload and user signature to your backend
- use this in your auth flow

This returns a [AuthenticationResponse](#messagetypesauthenticationresponse)

```js
await hashconnect.authenticate(topic, signingAcct, serverSigningAccount, serverSignature, payload);
```

**Example Implementation:**

```js
async send() {
    //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST SIGN THE PAYLOAD IN YOUR BACKEND
    // after verified on the server, generate some sort of auth token to use with your backend
    let payload = { url: "test.com", data: { token: "fufhr9e84hf9w8fehw9e8fhwo9e8fw938fw3o98fhjw3of" } };

    let signing_data = this.SigningService.signData(payload);

    //this line you should do client side, after generating the signed payload on the server
    let res = await this.HashconnectService.hashconnect.authenticate(this.HashconnectService.initData.topic, this.signingAcct, signing_data.serverSigningAccount, signing_data.signature, payload);
    //send res to backend for validation
    
    //THE FOLLOWING IS SERVER SIDE ONLY
    let url = "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + this.signingAcct;

    fetch(url, { method: "GET" }).then(async accountInfoResponse => {
        if (accountInfoResponse.ok) {
            let data = await accountInfoResponse.json();
            console.log("Got account info", data);

            if(!res.signedPayload) return; 
            
                let server_key_verified = this.SigningService.verifyData(res.signedPayload.originalPayload, this.SigningService.publicKey, res.signedPayload.serverSignature as Uint8Array);
                let user_key_verified = this.SigningService.verifyData(res.signedPayload, data.key.key, res.userSignature as Uint8Array);

            if(server_key_verified && user_key_verified)
                //authenticated
            else 
                //not authenticated
        } else {
            alert("Error getting public key")
        }
    })
    //!!!!!!!!!! DO NOT DO THIS ON THE CLIENT SIDE - YOU MUST PASS THE TRANSACTION BYTES TO THE SERVER AND VERIFY THERE
    
}
```

### Provider/Signer

In accordance with [HIP-338](https://hips.hedera.com/hip/hip-338) and [hethers.js](https://docs.hedera.com/hethers/getting-started) we have added provider/signer support.

You need to initialize HashConnect normally, then once you have your ```hashconnect``` variable you can use the ```.getProvider()``` and ```.getSigner()``` methods.

#### Get Provider

Just pass in these couple variables, and you'll get a provider back! 

This allows you to interact using the API's [detailed here](https://docs.hedera.com/hethers/application-programming-interface/providers/provider).

```js
provider = hashconnect.getProvider(network, topic, accountId);
```

Example Usage

```js
let balance = await provider.getAccountBalance(accountId);
```

#### Get Signer

Pass the provider into this method to get a signer back, this allows you to interact with HashConnect using a simpler API.

```js
signer = hashconnect.getSigner(provider);
```

##### Usage

```js
let trans = await new TransferTransaction()
    .addHbarTransfer(fromAccount, -1)
    .addHbarTransfer(toAccount, 1)
    .freezeWithSigner(this.signer);

let res = await trans.executeWithSigner(this.signer);
```

### Types

#### HashConnectTypes

##### HashConnectTypes.AppMetadata
```js 
export interface AppMetadata {
    name: string;
    description: string;
    url?: string;
    icon: string;
    encryptionKey?: string;
}
```

##### HashConnectTypes.WalletMetadata

```js 
export interface WalletMetadata {
    name: string;
    description: string;
    url?: string;
    icon: string;
    encryptionKey?: string;
}
```

##### HashConnectTypes.InitilizationData

```js 
export interface InitilizationData {
    topic: string;
    pairingString: string;
    encryptionKey: string;
    savedPairings: SavedPairingData[]
}
```

##### HashConnectTypes.SavedPairingData

```js
export interface SavedPairingData {
    metadata: HashConnectTypes.AppMetadata | HashConnectTypes.WalletMetadata;
    topic: string;
    encryptionKey?: string;
    network: string;
    origin?: string;
    accountIds: string[],
    lastUsed: number;
}
```

##### HashConnectConnectionState

```js 
export enum HashConnectConnectionState {
    Connecting="Connecting",
    Connected="Connected",
    Disconnected="Disconnected",
    Paired="Paired"
}
```

#### MessageTypes

All messages types inherit topicID and ID from ```BaseMessage```

##### MessageTypes.BaseMessage

```js
export interface BaseMessage {
    topic: string;
    id: string;
}   
```

##### MessageTypes.Acknowledge

```js
export interface Acknowledge extends BaseMessage {
    result: boolean;
    msg_id: string; //id of the message being acknowledged
}
```

##### MessageTypes.Rejected

```js
export interface Rejected extends BaseMessage {
    reason?: string;
    msg_id: string;
}
```

##### MessageTypes.ApprovePairing

```js 

export interface ApprovePairing extends BaseMessage {
    metadata: HashConnectTypes.WalletMetadata;
    accountIds: string[];
    network: string;
}
```

##### MessageTypes.AdditionalAccountRequest

```js
export interface AdditionalAccountRequest extends BaseMessage {
    network: string;
    multiAccount: boolean;
}
```

##### MessageTypes.AdditionalAccountResponse

```js
export interface AdditionalAccountResponse extends BaseMessage {
    accountIds: string[];
    network: string;
}
```

##### MessageTypes.Transaction

```js
export interface Transaction extends BaseMessage {
    byteArray: Uint8Array | string;
    metadata: TransactionMetadata;
}
```

##### MessageTypes.TransactionMetadata

```js
export class TransactionMetadata extends BaseMessage {
    accountToSign: string;
    returnTransaction: boolean; //set to true if you want the wallet to return a signed transaction instead of executing it
    hideNft?: boolean; //set to true to hide NFT preview for blind mints
}
```

##### MessageTypes.TransactionResponse

```js

export interface TransactionResponse extends BaseMessage {
    success: boolean;
    receipt?: Uint8Array | string; //returns receipt on success
    signedTransaction?: Uint8Array | string; //will return signed transaction rather than executing if returnTransaction in request is true
    error?: string; //error code on response
}
```

##### MessageTypes.AuthenticationRequest
```js
export interface AuthenticationRequest extends BaseMessage {
    accountToSign: string;
    serverSigningAccount: string;
    serverSignature: Uint8Array | string;
    payload: {
        url: string,
        data: any
    }
}
```

##### MessageTypes.AuthenticationResponse

```js
export interface AuthenticationResponse extends BaseMessage {
    success: boolean;
    error?: string;
    userSignature?: Uint8Array | string;
    signedPayload?: {
        serverSignature: Uint8Array | string,
        originalPayload: {
            url: string,
            data: any
        }
    }
}
```

##### MessageTypes.SigningRequest
```js
export interface SigningRequest extends BaseMessage {
    accountToSign: string;
    payload: string | object
}
```

##### MessageTypes.SigningResponse

```js
export interface SigningResponse extends BaseMessage {
    success: boolean;
    error?: string;
    userSignature?: Uint8Array | string;
    signedPayload?: string | object
}
```