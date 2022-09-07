import { Event } from "ts-typed-events";
import { WebSocketRelay } from "./types/relay";
import { MessageUtil, MessageHandler, RelayMessageType } from "./message";
import { HashConnectConnectionState } from "./types/hashconnect";
import { HashConnectProvider } from "./provider/provider";
import { HashConnectSigner } from "./provider/signer";
global.Buffer = global.Buffer || require('buffer').Buffer;
/**
 * Main interface with hashpack
 */
export class HashConnect {
    constructor(debug) {
        this.encryptionKeys = {}; //enc keys with topic id as the key
        this.debug = false;
        this.status = HashConnectConnectionState.Disconnected; //do we even need this?
        this.hcData = {
            topic: "",
            pairingString: "",
            encryptionKey: "",
            pairingData: [],
        };
        this.relay = new WebSocketRelay(this);
        this.foundExtensionEvent = new Event();
        this.foundIframeEvent = new Event();
        this.pairingEvent = new Event();
        this.transactionEvent = new Event();
        this.acknowledgeMessageEvent = new Event();
        this.additionalAccountRequestEvent = new Event();
        this.connectionStatusChangeEvent = new Event();
        this.authRequestEvent = new Event();
        this.messages = new MessageUtil();
        this.messageParser = new MessageHandler();
        if (debug)
            this.debug = debug;
        this.setupEvents();
    }
    async init(metadata, network, singleAccount = true) {
        return new Promise(async (resolve) => {
            let initData = {
                topic: "",
                pairingString: "",
                encryptionKey: "",
                savedPairings: []
            };
            this.metadata = metadata;
            if (this.debug)
                console.log("hashconnect - Initializing");
            if (typeof window !== "undefined") {
                this.metadata.url = window.location.origin;
            }
            else if (!metadata.url) {
                throw new Error("metadata.url must be defined if not running hashconnect within a browser");
            }
            await this.relay.init();
            if (this.debug)
                console.log("hashconnect - Initialized");
            if (!this.loadLocalData()) {
                if (this.debug)
                    console.log("hashconnect - No local data found, initializing");
                //first init, store the private key in localstorage
                this.hcData.encryptionKey = await this.generateEncryptionKeys();
                this.metadata.encryptionKey = this.hcData.encryptionKey;
                // this.metadata.publicKey = this.hcData.encryptionKey; //todo: remove as depracted
                initData.encryptionKey = this.hcData.encryptionKey;
                //then connect, storing the new topic in localstorage
                const topic = await this.connect();
                if (this.debug)
                    console.log("hashconnect - Received state", topic);
                this.hcData.topic = topic;
                initData.topic = topic;
                //generate a pairing string, which you can display and generate a QR code from
                this.hcData.pairingString = this.generatePairingString(topic, network, !singleAccount);
                initData.pairingString = this.hcData.pairingString;
                this.saveDataInLocalstorage();
                this.status = HashConnectConnectionState.Connected;
                this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);
            }
            else {
                if (this.debug)
                    console.log("hashconnect - Found saved local data", this.hcData);
                this.metadata.encryptionKey = this.hcData.encryptionKey;
                this.status = HashConnectConnectionState.Connecting;
                this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connecting);
                initData.pairingString = this.hcData.pairingString;
                initData.topic = this.hcData.topic;
                initData.encryptionKey = this.hcData.encryptionKey;
                initData.savedPairings = this.hcData.pairingData;
                this.connect(initData.topic, this.metadata, initData.encryptionKey);
                this.status = HashConnectConnectionState.Connected;
                this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);
                for (let pairing of this.hcData.pairingData) {
                    await this.connect(pairing.topic, pairing.metadata, pairing.encryptionKey);
                }
                if (this.hcData.pairingData.length > 0) {
                    this.status = HashConnectConnectionState.Paired;
                    this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Paired);
                }
            }
            if (this.debug)
                console.log("hashconnect - init data", initData);
            this.findLocalWallets();
            resolve(initData);
        });
    }
    async connect(topic, metadataToConnect, encryptionKey) {
        if (!topic) {
            topic = this.messages.createRandomTopicId();
            this.encryptionKeys[topic] = this.hcData.encryptionKey;
            if (this.debug)
                console.log("hashconnect - Created new topic id - " + topic);
        }
        if (metadataToConnect) {
            this.encryptionKeys[topic] = encryptionKey;
        }
        await this.relay.subscribe(topic);
        return topic;
    }
    async disconnect(topic) {
        if (topic != this.hcData.topic) //only unsub from topic if not dapp
            await this.relay.unsubscribe(topic);
        let index = this.hcData.pairingData.findIndex(pairing => pairing.topic == topic);
        this.hcData.pairingData.splice(index, 1);
        if (this.hcData.pairingData.length == 0) {
            this.status = HashConnectConnectionState.Connected;
            this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Connected);
        }
        this.saveDataInLocalstorage();
    }
    /**
     * Set up event connections
     */
    setupEvents() {
        // This will listen for a payload emission from the relay
        if (this.debug)
            console.log("hashconnect - Setting up events");
        this.relay.payload.on(async (payload) => {
            if (!payload)
                return;
            //this is redundant until protobuffs are re-implemented
            const message = await this.messages.decode(payload, this);
            await this.messageParser.onPayload(message, this);
        });
        this.pairingEvent.on((pairingEvent) => {
            this.hcData.pairingData.push(pairingEvent.pairingData);
            this.saveDataInLocalstorage();
        });
        this.foundIframeEvent.on(walletMetadata => {
            if (this.debug)
                console.log("hashconnect - Found iframe wallet", walletMetadata);
            this.connectToIframeParent();
        });
    }
    /**
     * Local data management
     */
    saveDataInLocalstorage() {
        if (typeof window === "undefined" || typeof localStorage === "undefined")
            return;
        let data = JSON.stringify(this.hcData);
        if (this.debug)
            console.log("hashconnect - saving local data", this.hcData);
        localStorage.setItem("hashconnectData", data);
    }
    loadLocalData() {
        if (typeof window === "undefined" || typeof localStorage === "undefined")
            return false;
        let foundData = localStorage.getItem("hashconnectData");
        if (foundData) {
            let data = JSON.parse(foundData);
            if (!data.pairingData || !data.encryptionKey) {
                if (this.debug)
                    console.log("hashconnect - legacy save data found, creating new data");
                return false;
            }
            this.hcData = data;
            return true;
        }
        else
            return false;
    }
    async clearConnectionsAndData() {
        if (this.debug)
            console.log("hashconnect - clearing local data - you will need to run init() again");
        for (let pairing of this.hcData.pairingData) {
            await this.relay.unsubscribe(pairing.topic);
        }
        this.hcData = {
            topic: "",
            pairingString: "",
            encryptionKey: "",
            pairingData: [],
        };
        if (typeof localStorage !== "undefined") {
            localStorage.removeItem("hashconnectData");
        }
        this.status = HashConnectConnectionState.Disconnected;
        this.connectionStatusChangeEvent.emit(HashConnectConnectionState.Disconnected);
    }
    /**
     * Send functions
     */
    async sendTransaction(topic, transaction) {
        transaction.byteArray = Buffer.from(transaction.byteArray).toString("base64");
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.Transaction, transaction, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        this.sendEncryptedLocalTransaction(msg);
        return await new Promise(resolve => this.transactionResolver = resolve);
    }
    async requestAdditionalAccounts(topic, message) {
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.AdditionalAccountRequest, message, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        return await new Promise(resolve => this.additionalAccountResolver = resolve);
    }
    async sendAdditionalAccounts(topic, message) {
        message.accountIds = message.accountIds.map(id => { return id; });
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.AdditionalAccountResponse, message, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        return message.id;
    }
    async sendTransactionResponse(topic, message) {
        if (message.receipt)
            message.receipt = Buffer.from(message.receipt).toString("base64");
        if (message.signedTransaction)
            message.signedTransaction = Buffer.from(message.signedTransaction).toString("base64");
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.TransactionResponse, message, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        return message.id;
    }
    async pair(pairingData, accounts, network) {
        if (this.debug)
            console.log("hashconnect - Pairing to " + pairingData.metadata.name);
        let state = await this.connect(pairingData.topic);
        let msg = {
            metadata: this.metadata,
            topic: pairingData.topic,
            accountIds: accounts,
            network: network
        };
        let newPairingData = {
            accountIds: msg.accountIds,
            metadata: pairingData.metadata,
            network: msg.network,
            topic: msg.topic,
            origin: msg.origin,
            lastUsed: new Date().getTime(),
            encryptionKey: pairingData.metadata.encryptionKey || pairingData.metadata.publicKey,
        };
        this.hcData.pairingData.push(newPairingData);
        this.saveDataInLocalstorage();
        //todo: remove as backwards compatibility
        if (newPairingData.metadata.publicKey) { //this is a old version of hashconnect trying to connect, do some trickery for backwards compatibility
            msg.metadata.publicKey = newPairingData.metadata.publicKey;
        }
        //clean up pairing data
        msg.metadata.description = this.sanitizeString(msg.metadata.description);
        msg.metadata.name = this.sanitizeString(msg.metadata.name);
        msg.network = this.sanitizeString(msg.network);
        msg.metadata.url = this.sanitizeString(msg.metadata.url);
        msg.accountIds = msg.accountIds.map(id => { return id; });
        //todo: remove as backwards compatibility (if statement only)
        if (pairingData.metadata.encryptionKey)
            msg.metadata.encryptionKey = pairingData.metadata.encryptionKey;
        //set topic/key mapping
        this.encryptionKeys[pairingData.topic] = pairingData.metadata.encryptionKey;
        if (pairingData.metadata.publicKey)
            this.encryptionKeys[pairingData.topic] = pairingData.metadata.publicKey; //todo: remove as backwards compatibility
        //send pairing approval
        const payload = await this.messages.prepareSimpleMessage(RelayMessageType.ApprovePairing, msg, msg.topic, this);
        this.relay.publish(pairingData.topic, payload, this.encryptionKeys[pairingData.topic]);
        return newPairingData;
    }
    async reject(topic, reason, msg_id) {
        let reject = {
            reason: reason,
            topic: topic,
            msg_id: msg_id
        };
        reject.reason = this.sanitizeString(reject.reason);
        // create protobuf message
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.RejectPairing, reject, topic, this);
        // Publish the rejection
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
    }
    async acknowledge(topic, pubKey, msg_id) {
        const ack = {
            result: true,
            topic: topic,
            msg_id: msg_id
        };
        const ackPayload = await this.messages.prepareSimpleMessage(RelayMessageType.Acknowledge, ack, topic, this);
        await this.relay.publish(topic, ackPayload, pubKey);
    }
    async authenticate(topic, account_id, server_signing_account, serverSignature, payload) {
        let message = {
            topic: topic,
            accountToSign: account_id,
            serverSigningAccount: server_signing_account,
            serverSignature: serverSignature,
            payload: payload
        };
        message.serverSignature = Buffer.from(message.serverSignature).toString("base64");
        console.log(message.serverSignature);
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.AuthenticationRequest, message, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        this.sendEncryptedLocalTransaction(msg);
        return await new Promise(resolve => this.authResolver = resolve);
    }
    async sendAuthenticationResponse(topic, message) {
        if (message.userSignature)
            message.userSignature = Buffer.from(message.userSignature).toString("base64");
        if (message.signedPayload)
            message.signedPayload.serverSignature = Buffer.from(message.signedPayload.serverSignature).toString("base64");
        const msg = await this.messages.prepareSimpleMessage(RelayMessageType.AuthenticationResponse, message, topic, this);
        await this.relay.publish(topic, msg, this.encryptionKeys[topic]);
        return message.id;
    }
    /**
     * Helpers
     */
    generatePairingString(topic, network, multiAccount) {
        if (this.debug)
            console.log("hashconnect - Generating pairing string");
        let data = {
            metadata: this.metadata,
            topic: topic,
            network: network,
            multiAccount: multiAccount,
        };
        data.metadata.description = this.sanitizeString(data.metadata.description);
        data.metadata.name = this.sanitizeString(data.metadata.name);
        data.network = this.sanitizeString(data.network);
        data.metadata.url = this.sanitizeString(data.metadata.url);
        let pairingString = Buffer.from(JSON.stringify(data)).toString("base64");
        this.hcData.pairingString = pairingString;
        return pairingString;
    }
    decodePairingString(pairingString) {
        let json_string = Buffer.from(pairingString, 'base64').toString();
        let data = JSON.parse(json_string);
        return data;
    }
    async generateEncryptionKeys() {
        let key = this.messages.createRandomTopicId();
        if (this.debug)
            console.log("hashconnect - Generated new encryption key - " + key);
        return key;
    }
    sanitizeString(str) {
        if (!str)
            return "";
        return str.replace(/[^\w. ]/gi, function (c) {
            if (c == ".")
                return ".";
            return '&#' + c.charCodeAt(0) + ';';
        });
    }
    /**
     * Local wallet stuff
     */
    findLocalWallets() {
        if (typeof window === "undefined") {
            if (this.debug)
                console.log("hashconnect - Cancel findLocalWallets - no window object");
            return;
        }
        if (this.debug)
            console.log("hashconnect - Finding local wallets");
        window.addEventListener("message", (event) => {
            if (event.data.type && (event.data.type == "hashconnect-query-extension-response")) {
                if (this.debug)
                    console.log("hashconnect - Local wallet metadata recieved", event.data);
                if (event.data.metadata)
                    this.foundExtensionEvent.emit(event.data.metadata);
            }
            if (event.data.type && event.data.type == "hashconnect-iframe-response") {
                if (this.debug)
                    console.log("hashconnect - iFrame wallet metadata recieved", event.data);
                if (event.data.metadata)
                    this.foundIframeEvent.emit(event.data.metadata);
            }
        }, false);
        setTimeout(() => {
            window.postMessage({ type: "hashconnect-query-extension" }, "*");
            if (window.parent)
                window.parent.postMessage({ type: "hashconnect-iframe-query" }, '*');
        }, 50);
    }
    connectToIframeParent() {
        if (typeof window === "undefined") {
            if (this.debug)
                console.log("hashconnect - Cancel iframe connection - no window object");
            return;
        }
        if (this.debug)
            console.log("hashconnect - Connecting to iframe parent wallet");
        window.parent.postMessage({ type: "hashconnect-iframe-pairing", pairingString: this.hcData.pairingString }, '*');
    }
    connectToLocalWallet() {
        if (typeof window === "undefined") {
            if (this.debug)
                console.log("hashconnect - Cancel connect to local wallet - no window object");
            return;
        }
        if (this.debug)
            console.log("hashconnect - Connecting to local wallet");
        //todo: add extension metadata support
        window.postMessage({ type: "hashconnect-connect-extension", pairingString: this.hcData.pairingString }, "*");
    }
    sendEncryptedLocalTransaction(message) {
        if (typeof window === "undefined") {
            if (this.debug)
                console.log("hashconnect - Cancel send local transaction - no window object");
            return;
        }
        if (this.debug)
            console.log("hashconnect - sending local transaction", message);
        window.postMessage({ type: "hashconnect-send-local-transaction", message: message }, "*");
    }
    async decodeLocalTransaction(message) {
        const local_message = await this.messages.decode(message, this);
        return local_message;
    }
    /**
     * Provider stuff
     */
    getProvider(network, topicId, accountToSign) {
        return new HashConnectProvider(network, this, topicId, accountToSign);
    }
    getSigner(provider) {
        return new HashConnectSigner(this, provider, provider.accountToSign, provider.topicId);
    }
    getPairingByTopic(topic) {
        let pairingData = this.hcData.pairingData.find(pairing => {
            return pairing.topic == topic;
        });
        if (!pairingData) {
            return null;
        }
        return pairingData;
    }
}
//# sourceMappingURL=hashconnect.js.map