import { RescueHBARRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import RescueHBARStableCoinService from '../../../../src/app/service/stablecoin/RescueHBARStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new RescueHBARStableCoinService();
const language: Language = new Language();
const request = new RescueHBARRequest({
  tokenId: '0.0.012345',
  amount: '10',
});

describe(`Testing RescueHBARStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'rescueHBAR').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance rescueHBARStableCoin', async () => {
    await service.rescueHBARStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.rescueHBAR).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
