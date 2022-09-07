import { HashConnect } from '../main';
import { RelayMessage, RelayMessageType } from './';
import { MessageTypes } from './relayMessage';
export declare class MessageUtil {
    /**
     * Compiles the simple protobuf with the specified paramaters
     *
     * @param message message to prepare
     * @param type type of message
     * @returns protobuf message
     */
    prepareSimpleMessage(type: RelayMessageType, data: MessageTypes.BaseMessage, topic: string, hc: HashConnect): Promise<string>;
    decode(payload: string, hc: HashConnect): Promise<RelayMessage>;
    /**
     * Generate a random topic ID UUID
     *
     * @returns random UUID topic ID
     */
    createRandomTopicId(): string;
    encrypt(string: string, key: string, hc: HashConnect): Promise<string>;
    decrypt(string: string, key: string, hc: HashConnect): Promise<string>;
}
