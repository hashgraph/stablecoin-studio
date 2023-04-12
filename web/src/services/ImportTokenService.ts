import { IAccountToken } from '../interfaces/IAccountToken';
import { IExternalToken } from '../interfaces/IExternalToken';

export class ImportTokenService {

    public static async importToken(tokenId: string, tokenSymbol: string, accountId: string) {
        const tokensAccount = localStorage?.tokensAccount;
        if (tokensAccount) {
            const tokensAccountParsed = JSON.parse(tokensAccount);
            const accountToken = tokensAccountParsed.find(
                (account: IAccountToken) => account.id === accountId,
            );
            if (
                accountToken &&
                accountToken.externalTokens.find((coin: IExternalToken) => coin.id === tokenId)
            ) {
                accountToken.externalTokens = accountToken.externalTokens.filter(
                    (coin: IExternalToken) => coin.id !== tokenId,
                );
            }
            accountToken
                ? accountToken.externalTokens.push({
                        id: tokenId,
                        symbol: tokenSymbol,
                  })
                : tokensAccountParsed.push({
                        id: accountId,
                        externalTokens: [
                            {
                                id: tokenId,
                                symbol: tokenSymbol,
                            },
                        ],
                  });
            localStorage.setItem('tokensAccount', JSON.stringify(tokensAccountParsed));
        } else {
            localStorage.setItem(
                'tokensAccount',
                JSON.stringify([
                    {
                        id: accountId,
                        externalTokens: [
                            {
                                id: tokenId,
                                symbol: tokenSymbol,
                            },
                        ],
                    },
                ]),
            );
        }        
    }
}

export default ImportTokenService;
