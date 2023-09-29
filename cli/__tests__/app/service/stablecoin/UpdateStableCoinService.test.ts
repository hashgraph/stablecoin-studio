import { StableCoin, UpdateRequest } from '@hashgraph/stablecoin-npm-sdk';
import UpdateStableCoinService from '../../../../src/app/service/stablecoin/UpdateStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new UpdateStableCoinService();
const language: Language = new Language();
const request = new UpdateRequest({
  tokenId: '0.0.012345',
});

describe(`Testing UpdateStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'update').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance update', async () => {
    await service.update(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.update).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
