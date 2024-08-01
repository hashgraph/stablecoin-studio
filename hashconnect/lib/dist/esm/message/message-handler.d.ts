import { IHashConnect } from "../types";
import { RelayMessage } from ".";
export interface IMessageHandler {
    onPayload(message: RelayMessage, hc: IHashConnect): Promise<void>;
}
export declare class MessageHandler implements IMessageHandler {
    onPayload(message: RelayMessage, hc: IHashConnect): Promise<void>;
}
