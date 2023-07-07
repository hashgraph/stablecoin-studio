import ManageImportedTokenService from '../../../../src/app/service/stablecoin/ManageImportedTokenService';
import { configurationService, utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import DetailsStableCoinService from '../../../../src/app/service/stablecoin/DetailsStableCoinService';

const service = new ManageImportedTokenService();
const language: Language = new Language();
const currentAccount = {
  accountId: '0.0.12345',
  privateKey: {
    key: 'key',
    type: 'type',
  },
  network: 'testnet',
  alias: 'alias',
  importedTokens: [],
};

const accounts = [currentAccount];

describe(`Testing ManageImportedTokenService class`, () => {
  beforeEach(() => {
    jest.spyOn(utilsService, 'cleanAndShowBanner').mockImplementation();
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue({ accounts });
    jest.spyOn(configurationService, 'setConfiguration').mockImplementation();
    jest.spyOn(utilsService, 'handleValidation').mockImplementation();
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    ///  jest.spyOn(utilsService, 'getCurrentMirror').mockReturnValue(currentConfig);
    ///  jest.spyOn(utilsService, 'getCurrentRPC').mockReturnValue(currentConfig);
    jest.spyOn(console, 'log').mockImplementation();
    ///  jest.spyOn(process, 'exit').mockImplementation();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Should instance start with Add', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Add'),
      );
    ///   jest.spyOn(utilsService, 'defaultMultipleAsk').mockResolvedValueOnce(language.getText('wizard.goBack.goBack'));
    ///    jest.spyOn(utilsService, 'defaultMultipleAsk').mockResolvedValueOnce(language.getText('wizard.mainOptions.Exit'));
    jest.spyOn(utilsService, 'defaultSingleAsk').mockResolvedValueOnce('id');
    jest.spyOn(DetailsStableCoinService.prototype, 'getDetailsStableCoins');
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ symbol: 'TEST' });

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
    //expect(console.log).toHaveBeenCalledWith(language.getText('manageImportedToken.importedTokenAlreadyAdded'));
  });
});
