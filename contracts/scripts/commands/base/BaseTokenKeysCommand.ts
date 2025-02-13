export interface BaseTokenKeysCommandParams {
    addKyc?: boolean
    addFeeSchedule?: boolean
}

export default class BaseTokenKeysCommand {
    public readonly addKyc: boolean = false
    public readonly addFeeSchedule: boolean = false

    constructor({ addKyc = false, addFeeSchedule = false }: BaseTokenKeysCommandParams) {
        this.addKyc = addKyc
        this.addFeeSchedule = addFeeSchedule
    }
}
