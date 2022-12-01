import { Operation, Access } from "../../domain/context/stablecoin/Capability.js";
import StableCoinCapabilities from "../../domain/context/stablecoin/StableCoinCapabilities.js";

export class CapabilityDecider {
	static decide(
		capabilities: StableCoinCapabilities,
		operation: Operation,
	): Decision {
		const extractedOperation = capabilities.capabilities.find(
			(op) => op.operation == operation,
		);

		if (!extractedOperation) return Decision.FORBIDDEN;
		if (extractedOperation.access == Access.CONTRACT)
			return Decision.CONTRACT;
		else return Decision.HTS;
	}
}

export enum Decision {
	FORBIDDEN,
	HTS,
    CONTRACT
}