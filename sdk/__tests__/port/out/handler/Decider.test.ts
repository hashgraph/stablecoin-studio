import { Capability, Operations, Accesses } from "../../../../src/domain/context/stablecoin/Capability";
import StableCoinCapabilities from "../../../../src/domain/context/stablecoin/StableCoinCapabilities";
import { StableCoin } from "../../../../src/domain/context/stablecoin/StableCoin";
import  Account  from "../../../../src/domain/context/account/Account";


describe('🧪 [BUILDER] HTSTransactionBuilder', () => {

    const operation = Operations.CASH_IN;
    const access = Accesses.CONTRACT;
    const capabilityCashIn = new Capability(operation, access);
    const capabilities = [capabilityCashIn];

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
    });
})