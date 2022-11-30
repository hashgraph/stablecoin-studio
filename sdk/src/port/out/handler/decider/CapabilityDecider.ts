import { Operations, Accesses } from "../../../../domain/context/stablecoin/Capability.js";
import StableCoinCapabilities from "../../../../domain/context/stablecoin/StableCoinCapabilities.js";

export class CapabilityDecider{

    static decide(
        capabilities: StableCoinCapabilities,
        operation: Operations
    ) : Decision{
        
        let extractedOperation = capabilities.capabilities.find(op => op.operation == operation);

        if(!extractedOperation) return Decision.FORBIDDEN
        if(extractedOperation.access == Accesses.CONTRACT) return Decision.CONTRACT;
        else return Decision.HTS;
    }
}

export enum Decision {
	FORBIDDEN,
	HTS,
    CONTRACT
}