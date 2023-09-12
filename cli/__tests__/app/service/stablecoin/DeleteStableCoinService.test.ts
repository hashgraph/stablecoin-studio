import { DeleteRequest, StableCoin } from '@hashgraph/stablecoin-npm-sdk';
import DeleteStableCoinService from '../../../../src/app/service/stablecoin/DeleteStableCoinService';
import { utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';

const service = new DeleteStableCoinService();
const language: Language = new Language();
const request = new DeleteRequest({ tokenId: '' });

describe(`Testing DeleteStableCoinService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(StableCoin, 'delete').mockImplementation();
    jest.spyOn(console, 'log');
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance deleteStableCoin', async () => {
    await service.deleteStableCoin(request);

    expect(service).not.toBeNull();
    expect(utilsService.showSpinner).toHaveBeenCalledTimes(1);
    expect(StableCoin.delete).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(
      language.getText('operation.success'),
    );
  });
});
