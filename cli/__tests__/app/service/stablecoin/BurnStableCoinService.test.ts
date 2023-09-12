import { BurnRequest, StableCoin } from '@hashgraph-dev/stablecoin-npm-sdk';
import BurnStableCoinService from '../../../../src/app/service/stablecoin/BurnStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new BurnStableCoinService();
const language: Language = new Language();
const request = new BurnRequest({
  tokenId: '0.0.012345',
  amount: '',
});

describe(`Testing BurnStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'burn').mockImplementation();
    jest.spyOn(console, 'log');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance burnStableCoin', async () => {
    await service.burnStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.burn).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
