import { Operations } from "../../../../domain/context/stablecoin/Capability.js";
import StableCoinCapabilities from "../../../../domain/context/stablecoin/StableCoinCapabilities.js";

export class CapabilityDecider{

    static decide(
        capabilities: StableCoinCapabilities,
        operation: Operations
    ) : Decision{
        return Decision.CONTRACT;
    }
}

export enum Decision {
	FORBIDDEN,
	HTS,
    CONTRACT
}