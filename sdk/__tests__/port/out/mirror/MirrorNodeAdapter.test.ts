import { ContractId } from "@hashgraph/sdk";
import PublicKey from "../../../../src/domain/context/account/PublicKey.js";
import { HederaId } from "../../../../src/domain/context/shared/HederaId.js";
import { StableCoin } from "../../../../src/domain/context/stablecoin/StableCoin.js";
import StableCoinList from "../../../../src/port/in/response/StableCoinList.js";
import AccountInfo from "../../../../src/port/in/response/AccountInfo.js";
import { MirrorNodeAdapter } from "../../../../src/port/out/mirror/MirrorNodeAdapter.js";

describe('🧪 [BUILDER] HTSTransactionBuilder', () => {
    const ed25519_accountId = '0.0.47792863';
    const ecdsa_accountId = '0.0.49032538';
    const tokenId = '0.0.48987373';
    const proxyId = '0.0.48987372';
    const ed25519_publicKey: PublicKey = new PublicKey({key: 'dae47b2200b1b52f90b5eeed17090d4424bbd7717df8dd130e0c2c754d280c1f', type: 'ED25519'});
    const ecdsa_publicKey: PublicKey = new PublicKey({key: '02e390856a2445a3c6e8465896f4f3f8dde98c687a4e76dae2f190f274af1ad2f1', type: 'ECDSA_SECP256K1'});

    let mn:MirrorNodeAdapter;
    beforeAll(async () => {
        mn = new MirrorNodeAdapter('testnet');
    });

    it('Test get stable coins list', async () => {
        const stableCoinList: StableCoinList[] = await mn.getstableCoinsList(ed25519_accountId);
        expect(stableCoinList.length).toEqual(32);      
    });

    it('Test get stable coin', async () => {
        const stableCoin: StableCoin = await mn.getStableCoin(tokenId);
        expect(stableCoin.tokenId).toEqual(new HederaId(tokenId));     
        expect(stableCoin.name).toEqual('HEDERACOIN');     
        expect(stableCoin.symbol).toEqual('HDC');     
        expect(stableCoin.decimals).toEqual(6);     
        expect(stableCoin.proxyAddress).toEqual(new HederaId(proxyId));     
        expect(stableCoin.evmProxyAddress).toEqual(ContractId.fromString(proxyId).toSolidityAddress());     
        expect(stableCoin.autoRenewAccount).toEqual(new HederaId(ed25519_accountId));   
        expect(stableCoin.autoRenewAccountPeriod).toEqual(90);  
        expect(stableCoin.treasury).toEqual(new HederaId(ed25519_accountId));
        expect(stableCoin.tokenType).toEqual('FUNGIBLE_COMMON');
        expect(stableCoin.supplyType).toEqual('INFINITE');
        expect(stableCoin.paused).toEqual(false);
        expect(stableCoin.deleted).toEqual(false);
        expect(stableCoin.adminKey).toEqual(ed25519_publicKey);
        expect(stableCoin.supplyKey).toEqual(ed25519_publicKey);
        expect(stableCoin.wipeKey).toEqual(ed25519_publicKey);
        expect(stableCoin.freezeKey).toEqual(ed25519_publicKey);
        expect(stableCoin.kycKey).toEqual(undefined);
        expect(stableCoin.pauseKey).toEqual(ed25519_publicKey);
    });

    it('Test get ed25519 account info', async () => {
        const accountInfo: AccountInfo = await mn.getAccountInfo(ed25519_accountId);
        expect(accountInfo.account).toEqual(ed25519_accountId);     
        expect(accountInfo.accountEvmAddress).toBeNull();     
        expect(accountInfo.publicKey).toEqual(ed25519_publicKey);    
        expect(accountInfo.alias).toBeNull(); 
    });    

    it('Test get ecdsa account info', async () => {
        const accountInfo: AccountInfo = await mn.getAccountInfo(ecdsa_accountId);
        expect(accountInfo.account).toEqual(ecdsa_accountId);     
        expect(accountInfo.accountEvmAddress).toEqual('0xb58c62f798d132a865429ee3c8968fed20b38116');     
        expect(accountInfo.publicKey).toEqual(ecdsa_publicKey);   
        expect(accountInfo.alias).toEqual('HIQQFY4QQVVCIRNDY3UEMWEW6TZ7RXPJRRUHUTTW3LRPDEHSOSXRVUXR');  
    });        
});