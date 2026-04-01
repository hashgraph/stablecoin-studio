interface GenerateKeyTypeCommandParams {
    adminKey?: boolean
    kycKey?: boolean
    freezeKey?: boolean
    wipeKey?: boolean
    supplyKey?: boolean
    feeScheduleKey?: boolean
    pauseKey?: boolean
    ignored?: boolean
}

export default class GenerateKeyTypeCommand {
    public readonly adminKey: boolean = false
    public readonly kycKey: boolean = false
    public readonly freezeKey: boolean = false
    public readonly wipeKey: boolean = false
    public readonly supplyKey: boolean = false
    public readonly feeScheduleKey: boolean = false
    public readonly pauseKey: boolean = false
    public readonly ignored: boolean = false

    constructor({
        adminKey = false,
        kycKey = false,
        freezeKey = false,
        wipeKey = false,
        supplyKey = false,
        feeScheduleKey = false,
        pauseKey = false,
        ignored = false,
    }: GenerateKeyTypeCommandParams = {}) {
        this.adminKey = adminKey
        this.kycKey = kycKey
        this.freezeKey = freezeKey
        this.wipeKey = wipeKey
        this.supplyKey = supplyKey
        this.feeScheduleKey = feeScheduleKey
        this.pauseKey = pauseKey
        this.ignored = ignored
    }
}
