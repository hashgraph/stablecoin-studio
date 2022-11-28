import { ContractExecuteTransaction, Hbar, HbarUnit, Transaction } from "@hashgraph/sdk";
import { HTSTransactionBuilder } from "../../../../src/port/out/builder/HTSTransactionBuilder.js";

describe('🧪 [SERVICE] ContractService', () => {
  
  beforeAll(async () => {
    // Mock
    
  });
 
  it('Test create contractExecuteTransaction', () => {
    const t:ContractExecuteTransaction = HTSTransactionBuilder.buildContractExecuteTransaction('133333',new Uint8Array,1000,1) as ContractExecuteTransaction;
    console.log(JSON.stringify(t));
    expect(t?.gas?.low).toEqual(1000);
    expect(t?.contractId?.num.low).toEqual(133333);
    expect(t?.payableAmount).toEqual(Hbar.from(1,HbarUnit.Hbar));

    expect(t?.gas?.low).not.toEqual(1001);
    expect(t?.contractId?.num.low).not.toEqual(123333);
    expect(t?.payableAmount).not.toEqual(Hbar.from(1,HbarUnit.Megabar));

  });




});