import {burnable} from "./burnable";
import {freezable} from "./freezable";
import { ContractId } from '@hashgraph/sdk'

describe('Stable Coin Studio test suite', () => {
    const deployedContractsForBurnableAndFreezable: ContractId[] = [];

    burnable(deployedContractsForBurnableAndFreezable);
    freezable(deployedContractsForBurnableAndFreezable);

});
