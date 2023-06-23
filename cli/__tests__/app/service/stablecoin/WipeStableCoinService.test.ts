import { StableCoin, WipeRequest } from "@hashgraph-dev/stablecoin-npm-sdk";
import WipeStableCoinService from "../../../../src/app/service/stablecoin/WipeStableCoinService";
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new WipeStableCoinService();
const language: Language = new Language();
const request = new WipeRequest({
  tokenId: '0.0.012345',
  amount: '10',
  targetId: ''
});

describe(`Testing WipeStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'wipe').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance wipeStableCoin', async () => {
    await service.wipeStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.wipe).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });
});
