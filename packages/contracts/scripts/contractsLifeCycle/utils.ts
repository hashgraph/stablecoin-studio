/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContractFactory } from 'ethers'
import {
    Client,
    ContractExecuteTransaction,
    ContractId,
    Hbar,
} from '@hashgraph/sdk'
import Web3 from 'web3'

const web3 = new Web3()

export async function contractCall(
    contractId: ContractId,
    functionName: string,
    parameters: any[],
    clientOperator: Client,
    gas: number,
    abi: any,
    value: number | string | Long | Hbar = 0
) {
    const functionCallParameters = encodeFunctionCall(
        functionName,
        parameters,
        abi
    )

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setFunctionParameters(functionCallParameters)
        .setGas(gas)
        .setPayableAmount(value)
        .execute(clientOperator)

    const record = await contractTx.getRecord(clientOperator)
    let results
    if (record.contractFunctionResult) {
        results = decodeFunctionResult(
            abi,
            functionName,
            record.contractFunctionResult?.bytes
        )
    }

    return results
}

function encodeFunctionCall(functionName: string, parameters: any[], abi: any) {
    const functionAbi = abi.find(
        (func: { name: string; type: string }) =>
            func.name === functionName && func.type === 'function'
    )
    const encodedParametersHex = web3.eth.abi
        .encodeFunctionCall(functionAbi, parameters)
        .slice(2)
    return Buffer.from(encodedParametersHex, 'hex')
}

function decodeFunctionResult(
    abi: any,
    functionName: string,
    resultAsBytes: Uint8Array
) {
    const functionAbi = abi.find(
        (func: { name: any }) => func.name === functionName
    )
    const functionParameters = functionAbi?.outputs
    const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'))
    const result = web3.eth.abi.decodeParameters(
        functionParameters || [],
        resultHex
    )

    const jsonParsedArray = JSON.parse(JSON.stringify(result))

    return jsonParsedArray
}

export function createContractFactory(factory: any): ContractFactory {
    return new ContractFactory(factory.createInterface(), factory.bytecode)
}
