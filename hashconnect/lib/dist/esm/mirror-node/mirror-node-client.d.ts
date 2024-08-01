import { NetworkType } from "../types";
export declare class MirrorNodeClient {
    url: string;
    constructor(network: NetworkType);
    getAccountInfo(accountId: string): Promise<{
        key: {
            key: string;
        };
    }>;
}
