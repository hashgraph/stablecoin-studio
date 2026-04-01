export const MESSAGES = {
    deploy: {
        error: {
            notInContractNameList: (name: string) =>
                `The contract name "${name}" is not in the list of contract names.`,
        },
    },
}

export enum TransactionStatus {
    REVERTED = 0,
    SUCCESS = 1,
}
