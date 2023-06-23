import { PauseRequest, StableCoin } from "@hashgraph-dev/stablecoin-npm-sdk";
import PauseStableCoinService from "../../../../src/app/service/stablecoin/PauseStableCoinService";
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new PauseStableCoinService();
const language: Language = new Language();
const request = new PauseRequest({ tokenId: '0.0.012345' });

describe(`Testing PauseStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance pauseStableCoin', async () => {
    jest.spyOn(StableCoin, 'pause').mockImplementation();
    await service.pauseStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.pause).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });

  it('Should instance unpauseStableCoin when granted', async () => {
    jest.spyOn(StableCoin, 'unPause').mockImplementation();
    await service.unpauseStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.unPause).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(language.getText('operation.success'));
  });
});
