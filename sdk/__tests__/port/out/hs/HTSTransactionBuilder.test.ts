import { AccountId, 
         ContractExecuteTransaction, 
         Hbar, 
         HbarUnit, 
         TokenId, 
         TokenWipeTransaction, 
         TokenMintTransaction, 
         TokenBurnTransaction, 
         TransferTransaction,
         TokenDeleteTransaction,
         TokenPauseTransaction,
         TokenUnpauseTransaction,
         TokenFreezeTransaction,
         TokenUnfreezeTransaction,
         ContractId } from "@hashgraph/sdk";
import Long from "long";
import nodeTest from "node:test";
import { HTSTransactionBuilder } from "../../../../src/port/out/builder/HTSTransactionBuilder.js";

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
  const contractId = '1111';
  const accountId = '2222'
  const tokenId = '3333';

  const contractId2 = '1110';
  const accountId2 = '2220'
  const tokenId2 = '3330';

  const accountId3 = '2200';
 
  it('Test create contractExecuteTransaction', () => {
    const t:ContractExecuteTransaction = HTSTransactionBuilder.buildContractExecuteTransaction(contractId, new Uint8Array, 1000, 1) as ContractExecuteTransaction;    expect(t?.gas?.low).toEqual(1000);
    expect(t?.gas?.low).toEqual(1000);
    expect(t?.contractId).toEqual(ContractId.fromString(contractId));
    expect(t?.payableAmount).toEqual(Hbar.from(1,HbarUnit.Hbar));

    expect(t?.gas?.low).not.toEqual(1001);
    expect(t?.contractId).not.toEqual(ContractId.fromString(contractId2));
    expect(t?.payableAmount).not.toEqual(Hbar.from(1,HbarUnit.Megabar));

  });

  it('Test create buildTokenWipeTransaction', () => {
    const t:TokenWipeTransaction = HTSTransactionBuilder.buildTokenWipeTransaction(accountId, tokenId, Long.ONE) as TokenWipeTransaction;
    expect(t?.accountId).toEqual(AccountId.fromString(accountId));
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
    expect(t?.amount).toEqual(Long.ONE);

    expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
    expect(t?.amount).not.toEqual(Long.ZERO);
  });

  it('Test create buildTokenMintTransaction', () => {
    const t:TokenMintTransaction = HTSTransactionBuilder.buildTokenMintTransaction(tokenId, Long.ONE) as TokenMintTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
    expect(t?.amount).toEqual(Long.ONE);

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
    expect(t?.amount).not.toEqual(Long.ZERO);
  });

  it('Test create buildTokenBurnTransaction', () => {
    const t:TokenBurnTransaction = HTSTransactionBuilder.buildTokenBurnTransaction(tokenId, Long.ONE) as TokenBurnTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
    expect(t?.amount).toEqual(Long.ONE);

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
    expect(t?.amount).not.toEqual(Long.ZERO);
  });

  it('Test create buildTokenTransferTransaction', () => {
    const t:TransferTransaction = HTSTransactionBuilder.buildTransferTransaction(tokenId, Long.ONE, accountId, accountId2) as TransferTransaction;
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId))).toEqual(Long.ONE.multiply(-1));
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId2))).toEqual(Long.ONE);

    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId))).not.toEqual(Long.ONE);
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId2))).not.toEqual(Long.ONE.multiply(-1));
  });

  it('Test create buildDeleteTransaction', () => {
    const t:TokenDeleteTransaction = HTSTransactionBuilder.buildDeleteTransaction(tokenId) as TokenDeleteTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
  });

  it('Test create buildPausedTransaction', () => {
    const t:TokenPauseTransaction = HTSTransactionBuilder.buildPausedTransaction(tokenId) as TokenPauseTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
  });

  it('Test create buildUnpausedTransaction', () => {
    const t:TokenUnpauseTransaction = HTSTransactionBuilder.buildUnpausedTransaction(tokenId) as TokenUnpauseTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
  });

  it('Test create buildFreezeTransaction', () => {
    const t:TokenFreezeTransaction = HTSTransactionBuilder.buildFreezeTransaction(tokenId, accountId) as TokenFreezeTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
    expect(t?.accountId).toEqual(AccountId.fromString(accountId));

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
    expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
  });

  it('Test create buildUnreezeTransaction', () => {
    const t:TokenUnfreezeTransaction = HTSTransactionBuilder.buildUnfreezeTransaction(tokenId, accountId) as TokenUnfreezeTransaction;
    expect(t?.tokenId).toEqual(TokenId.fromString(tokenId));
    expect(t?.accountId).toEqual(AccountId.fromString(accountId));

    expect(t?.tokenId).not.toEqual(TokenId.fromString(tokenId2));
    expect(t?.accountId).not.toEqual(AccountId.fromString(accountId2));
  });

  it('Test create buildApprovedTransferTransaction', () => {
    const t:TransferTransaction = HTSTransactionBuilder.buildTransferTransaction(tokenId, Long.ONE, accountId, accountId2) as TransferTransaction;
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId))).toEqual(Long.ONE.multiply(-1));
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId2))).toEqual(Long.ONE);

    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId))).not.toEqual(Long.ONE);
    expect(t?.tokenTransfers.get(TokenId.fromString(tokenId))?.get(AccountId.fromString(accountId2))).not.toEqual(Long.ONE.multiply(-1));
  });


});