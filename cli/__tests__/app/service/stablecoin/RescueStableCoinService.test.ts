import { RescueRequest, StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import RescueStableCoinService from "../../../../src/app/service/stablecoin/RescueStableCoinService";
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new RescueStableCoinService();
const language: Language = new Language();
const request = new RescueRequest({
  tokenId: '0.0.012345',
  amount: '10'
});

describe(`Testing RescueStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'rescue').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance rescueStableCoin', async () => {
    await service.rescueStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.rescue).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });
});
