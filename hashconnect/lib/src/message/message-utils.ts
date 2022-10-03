import { v4 as uuidv4 } from 'uuid';
import { HashConnect } from '../main';
import { RelayMessage, RelayMessageType } from './';
import { MessageTypes } from './relayMessage';
import SimpleCrypto from "simple-crypto-js"

// const protons = require('protons');

export class MessageUtil {
    
    // private proto = protons(`
    // message SimpleMessage {
    //     uint64 timestamp = 1;
    //     string type = 2;
    //     string data = 3;
    // }`);

    /**
     * Compiles the simple protobuf with the specified paramaters 
     * 
     * @param message message to prepare
     * @param type type of message
     * @returns protobuf message
     */
    public async prepareSimpleMessage(type: RelayMessageType, data: MessageTypes.BaseMessage, topic: string, hc: HashConnect): Promise<string> {

        data.id = uuidv4();

        if (hc.debug) console.log("hashconnect - Sending message - id: " + data.id);

        //uncomment this to encode as protobuff

        let encryptedData = await this.encrypt(JSON.stringify(data), hc.encryptionKeys[data.topic], hc);

        let message = new RelayMessage(
            Date.now(),
            type,
            encryptedData,
            topic
            // JSON.stringify(data)
        );

        return JSON.stringify(message);
    }

    public async decode(payload: string, hc: HashConnect): Promise<RelayMessage> {
        if (hc.debug) console.log("hashconnect - decoding message payload")

        //todo: this is temporary to enable backwards compatibility
        let parsedPayload:any = payload;
        if(typeof(payload) == "string") parsedPayload = JSON.parse(payload);

        let message: RelayMessage = parsedPayload;

        message.data = await this.decrypt(message.data, hc.encryptionKeys[message.topic], hc);
        
        //uncomment this to decode protobuf
        // return this.proto.SimpleMessage.decode(payload)
        // this.decrypt(payload, hc.encryptionKeys[])
        
        return message
    }

    /**
     * Generate a random topic ID UUID 
     * 
     * @returns random UUID topic ID
     */
    public createRandomTopicId(): string {
        return uuidv4()
    }

    async encrypt(string: string, key: string, hc: HashConnect): Promise<string> {
        if (hc.debug) console.log("hashconnect - encrypting with key: " + key);
        if (hc.debug) console.log("Topic key mapping", hc.encryptionKeys);

        var simpleCrypto = new SimpleCrypto(key)
        
        return simpleCrypto.encrypt(string);
    }

    async decrypt(string: string, key: string, hc: HashConnect): Promise<string> {
        if (hc.debug) console.log("hashconnect - decryption with key: " + key);
        var simpleCrypto = new SimpleCrypto(key)
        let text:string = simpleCrypto.decrypt(string) as string;
        return text;
    }
}