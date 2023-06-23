import { CashInRequest, StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import CashInStableCoinService from "../../../../src/app/service/stablecoin/CashInStableCoinService";
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new CashInStableCoinService();
const language: Language = new Language();
const request = new CashInRequest({
  tokenId: '',
  targetId: '',
  amount: '',
});

describe(`Testing CashInStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'cashIn').mockImplementation();
    jest.spyOn(console, "log");
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance cashInStableCoin', async () => {
    await service.cashInStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.cashIn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });
});
