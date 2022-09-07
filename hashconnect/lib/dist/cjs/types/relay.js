"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketRelay = void 0;
const tslib_1 = require("tslib");
const ts_typed_events_1 = require("ts-typed-events");
const _1 = require(".");
const isomorphic_ws_1 = tslib_1.__importDefault(require("isomorphic-ws"));
class WebSocketRelay {
    constructor(hc) {
        this.subscribedTopics = [];
        this.connected = new ts_typed_events_1.Event();
        this.payload = new ts_typed_events_1.Event();
        this.hc = hc;
    }
    // TODO: is there a better way to do this?
    processMessage(e) {
        if (this.hc.debug)
            console.log("hashconnect - emitting payload");
        let dataStr = "";
        if (typeof e.data === "string") {
            dataStr = e.data;
        }
        else {
            dataStr = e.data.toString();
        }
        this.payload.emit(JSON.parse(dataStr));
    }
    async init() {
        // TODO error flow
        return new Promise((resolve) => {
            this.connectToSocket(() => {
                resolve();
            });
        });
    }
    connectToSocket(callback) {
        // this.socket = new WebSocket('ws://localhost:9001');
        this.socket = new isomorphic_ws_1.default('wss://hashconnect.hashpack.app');
        this.socket.onopen = () => {
            if (this.hc.debug)
                console.log("hashconnect - connected");
            this.hc.connectionStatusChangeEvent.emit(_1.HashConnectConnectionState.Connected);
            callback();
        };
        this.socket.onclose = () => {
            this.hc.status = _1.HashConnectConnectionState.Disconnected;
            if (this.hc.debug)
                console.log("hashconnect - disconnected");
            this.hc.connectionStatusChangeEvent.emit(_1.HashConnectConnectionState.Disconnected);
            setTimeout(() => {
                this.reconnect();
            }, 300);
        };
    }
    reconnect() {
        if (this.hc.debug)
            console.log("hashconnect - reconnecting...");
        this.connectToSocket(async () => {
            for (let topic of this.subscribedTopics) {
                await this.subscribe(topic);
            }
            this.hc.status = _1.HashConnectConnectionState.Connected;
            if (this.hc.debug)
                console.log("hashconnect - reconnected");
        });
    }
    async subscribe(topic) {
        if (this.hc.debug)
            console.log("hashconnect - Subscribing to topic id " + topic);
        if (this.subscribedTopics.indexOf(topic) == -1)
            this.subscribedTopics.push(topic);
        this.socket.send(JSON.stringify({ action: 'sub', topic: topic }));
        this.socket.onmessage = (e) => {
            console.log("process", e);
            this.processMessage(e);
        };
    }
    addDecryptionKey(privKey, topic) {
        console.log("hashconnect - Adding decryption key \n PrivKey: " + privKey);
        if (this.hc.debug)
            console.log("hashconnect - Adding decryption key \n PrivKey: " + privKey);
        this.hc.encryptionKeys[topic] = privKey;
    }
    async unsubscribe(topic) {
        if (this.hc.debug)
            console.log("hashconnect - Unsubscribing to " + topic);
        this.socket.send(JSON.stringify({ action: "unsub", topic: topic }));
    }
    // TODO: determine appropriate types for sending messages, string should suffice for now
    async publish(topic, message, pubKey) {
        const msg = {
            action: "pub",
            payload: JSON.stringify(message),
            topic: topic
        };
        if (this.hc.debug)
            console.log("hashconnect - Sending payload to " + topic, "\n encrypted with " + pubKey);
        await this.socket.send(JSON.stringify(msg));
    }
}
exports.WebSocketRelay = WebSocketRelay;
//# sourceMappingURL=relay.js.map