import { Event } from "ts-typed-events";
import { HashConnect } from "../main";
/**
 * Relay interface
 */
export interface IRelay {
    connected: Event<any>;
    payload: Event<any>;
    /**
     * Initialize the relay
     */
    init(): Promise<void>;
    /**
     * Publish a message
     *
     * @param topic topic to publish to
     * @param message message to send
     */
    publish(topic: string, message: string | any, pubKey: string): Promise<void>;
    /**
     * Subscribe to a topic
     *
     * @param topic topic to subscribe to
     */
    subscribe(topic: string): Promise<void>;
    /**
     * Unsubscribe from a topic
     *
     * @param topic topic to unsubscribe from
     */
    unsubscribe(topic: string): Promise<void>;
    addDecryptionKey(privKey: string, topic: string): void;
}
export declare class WebSocketRelay implements IRelay {
    private socket;
    connected: Event<any>;
    payload: Event<any>;
    hc: HashConnect;
    subscribedTopics: string[];
    private processMessage;
    constructor(hc: HashConnect);
    init(): Promise<void>;
    connectToSocket(callback: () => void): void;
    reconnect(): void;
    subscribe(topic: string): Promise<void>;
    addDecryptionKey(privKey: string, topic: string): void;
    unsubscribe(topic: string): Promise<void>;
    publish(topic: string, message: any, pubKey: string): Promise<void>;
}
