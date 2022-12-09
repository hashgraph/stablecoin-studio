import { ContractId } from "@hashgraph/sdk";
import PublicKey from "../../../../src/domain/context/account/PublicKey.js";
import StableCoinList from "../../../../src/port/out/mirror/response/StableCoinListViewModel.js";
import StableCoinDetail from "../../../../src/port/out/mirror/response/StableCoinViewModel.js";
import AccountInfo from "../../../../src/port/out/mirror/response/AccountViewModel.js";
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
        const stableCoinDetail: StableCoinDetail = await mn.getStableCoin(tokenId);
        expect(stableCoinDetail.tokenId).toEqual(tokenId);     
        expect(stableCoinDetail.name).toEqual('HEDERACOIN');     
        expect(stableCoinDetail.symbol).toEqual('HDC');     
        expect(stableCoinDetail.decimals).toEqual(6);     
        expect(stableCoinDetail.proxyAddress).toEqual(proxyId);     
        expect(stableCoinDetail.evmProxyAddress).toEqual(ContractId.fromString(proxyId).toSolidityAddress());     
        expect(stableCoinDetail.autoRenewAccount).toEqual(ed25519_accountId);   
        expect(stableCoinDetail.autoRenewAccountPeriod).toEqual(90);  
        expect(stableCoinDetail.treasury).toEqual(ed25519_accountId);
        expect(stableCoinDetail.paused).toEqual(false);
        expect(stableCoinDetail.deleted).toEqual(false);
        expect(stableCoinDetail.adminKey).toEqual(ed25519_publicKey);
        expect(stableCoinDetail.supplyKey).toEqual(ed25519_publicKey);
        expect(stableCoinDetail.wipeKey).toEqual(ed25519_publicKey);
        expect(stableCoinDetail.freezeKey).toEqual(ed25519_publicKey);
        expect(stableCoinDetail.kycKey).toEqual(undefined);
        expect(stableCoinDetail.pauseKey).toEqual(ed25519_publicKey);
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