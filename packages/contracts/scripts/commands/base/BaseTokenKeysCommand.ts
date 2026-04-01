export interface BaseTokenKeysCommandParams {
    addKyc?: boolean
    addFeeSchedule?: boolean
    addSupply?: boolean
    addWipe?: boolean
}

export default class BaseTokenKeysCommand {
    public readonly addKyc: boolean = false
    public readonly addFeeSchedule: boolean = false
    public readonly addSupply?: boolean
    public readonly addWipe?: boolean

    constructor({ addKyc = false, addFeeSchedule = false, addSupply, addWipe }: BaseTokenKeysCommandParams) {
        this.addKyc = addKyc
        this.addFeeSchedule = addFeeSchedule
        this.addSupply = addSupply
        this.addWipe = addWipe
    }
}
