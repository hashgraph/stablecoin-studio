import Account from "../../../src/domain/context/account/Account.js";
import { Capability, Operation, Access } from "../../../src/domain/context/stablecoin/Capability.js";
import { StableCoin } from "../../../src/domain/context/stablecoin/StableCoin.js";
import StableCoinCapabilities from "../../../src/domain/context/stablecoin/StableCoinCapabilities.js";
import { CapabilityDecider, Decision } from "../../../src/port/out/CapabilityDecider.js";


describe('🧪 [BUILDER] HTSTransactionBuilder', () => {


    const capabilities: Capability[] = [new Capability(Operation.CASH_IN, Access.CONTRACT),
        new Capability(Operation.BURN, Access.HTS)];

    const coin = new StableCoin({
        "name": "name",
        "symbol": "symbol",
        "decimals": 3
    });

    const account = new Account({
        "environment": "testnet"
    });

    const stableCoin = new StableCoinCapabilities(coin, capabilities, account);

    it('Test decider', async () => {
        const CashIn_Decider =  CapabilityDecider.decide(stableCoin, Operation.CASH_IN);
        const Burn_Decider =  CapabilityDecider.decide(stableCoin, Operation.BURN);
        const Wipe_Decider =  CapabilityDecider.decide(stableCoin, Operation.WIPE);
        const Freeze_Decider =  CapabilityDecider.decide(stableCoin, Operation.FREEZE);
        const UnFreeze_Decider =  CapabilityDecider.decide(stableCoin, Operation.UNFREEZE);
        const Pause_Decider =  CapabilityDecider.decide(stableCoin, Operation.PAUSE);
        const UnPause_Decider =  CapabilityDecider.decide(stableCoin, Operation.UNPAUSE);
        const Delete_Decider =  CapabilityDecider.decide(stableCoin, Operation.DELETE);
        const Rescue_Decider =  CapabilityDecider.decide(stableCoin, Operation.RESCUE);
        const RoleManagement_Decider =  CapabilityDecider.decide(stableCoin, Operation.ROLE_MANAGEMENT);


        expect(CashIn_Decider).toEqual(Decision.CONTRACT);
        expect(Burn_Decider).toEqual(Decision.HTS);
        expect(Wipe_Decider).toEqual(Decision.FORBIDDEN);
        expect(Freeze_Decider).toEqual(Decision.FORBIDDEN);
        expect(UnFreeze_Decider).toEqual(Decision.FORBIDDEN);
        expect(Pause_Decider).toEqual(Decision.FORBIDDEN);
        expect(UnPause_Decider).toEqual(Decision.FORBIDDEN);
        expect(Delete_Decider).toEqual(Decision.FORBIDDEN);
        expect(Rescue_Decider).toEqual(Decision.FORBIDDEN);
        expect(RoleManagement_Decider).toEqual(Decision.FORBIDDEN);

    });
})