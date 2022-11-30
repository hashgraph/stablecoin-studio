import Web3 from 'web3';
import { TransactionResponseError } from './error/TransactionResponseError.js';

export class TransactionResponseHandler {
    public static decodeFunctionResult(
        functionName: string,
        resultAsBytes: ArrayBuffer,
        abi: any, // eslint-disable-line
    ): Uint8Array {
        try {
            const web3 = new Web3();

            let functionAbi;
            if (abi) {
                functionAbi = abi.find(
                    (func: { name: string }) => func.name === functionName,
                );
            } else {
                throw new TransactionResponseError({
                    message: `ABI is undefined, so it could not be possible to find contract function`,
                });
            }
            if (!functionAbi?.outputs)
                throw new TransactionResponseError({
                    message: `Contract function ${functionName} not found in ABI, are you using the right version?`,
                });
            const functionParameters = functionAbi?.outputs;
            const resultHex = '0x'.concat(
                Buffer.from(resultAsBytes).toString('hex'),
            );
            const result = web3.eth.abi.decodeParameters(
                functionParameters || [],
                resultHex,
            );

            const jsonParsedArray = JSON.parse(JSON.stringify(result));
            return jsonParsedArray;
        } catch (error) {
            throw new TransactionResponseError({
                message: 'Could not decode function result',
            });
        }
    }
}