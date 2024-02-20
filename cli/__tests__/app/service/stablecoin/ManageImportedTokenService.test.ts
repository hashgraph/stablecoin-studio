import ManageImportedTokenService from '../../../../src/app/service/stablecoin/ManageImportedTokenService';
import { configurationService, utilsService } from '../../../../src/index.js';
import Language from '../../../../src/domain/language/Language.js';
import DetailsStableCoinService from '../../../../src/app/service/stablecoin/DetailsStableCoinService';
import WizardService from '../../../../src/app/service/wizard/WizardService';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';

const service = new ManageImportedTokenService();
const language: Language = new Language();
const currentAccount = {
  accountId: '0.0.12345',
  type: AccountType.SelfCustodial,
  selfCustodial: {
    privateKey: {
      key: 'key',
      type: 'type',
    },
  },
  network: 'testnet',
  alias: 'alias',
  importedTokens: [
    {
      id: '0.0.12345',
      symbol: 'TEST',
    },
  ],
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
    jest.spyOn(utilsService, 'showMessage').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
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
    jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockResolvedValueOnce('0.0.12345')
      .mockResolvedValueOnce('0.0.123456');
    jest.spyOn(DetailsStableCoinService.prototype, 'getDetailsStableCoins');
    DetailsStableCoinService.prototype.getDetailsStableCoins = jest
      .fn()
      .mockResolvedValue({ symbol: 'TEST' });

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementationOnce(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Refresh', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Refresh'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        `${currentAccount.importedTokens[0].id} - ${currentAccount.importedTokens[0].symbol}`,
      );

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementationOnce(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Refresh without tokens', async () => {
    const currentAccount = {
      accountId: '0.0.12345',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'key',
          type: 'type',
        },
      },
      network: 'testnet',
      alias: 'alia',
      importedTokens: [],
    };
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Refresh'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Refresh goback', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Refresh'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Remove', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Remove'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        `${currentAccount.importedTokens[0].id} - ${currentAccount.importedTokens[0].symbol}`,
      );

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Remove without tokens', async () => {
    const currentAccount = {
      accountId: '0.0.12345',
      type: AccountType.SelfCustodial,
      selfCustodial: {
        privateKey: {
          key: 'key',
          type: 'type',
        },
      },
      network: 'testnet',
      alias: 'alias',
      importedTokens: [],
    };
    jest
      .spyOn(utilsService, 'getCurrentAccount')
      .mockReturnValue(currentAccount);
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Remove'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with Remove goback', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce(
        language.getText('wizard.manageImportedTokens.Remove'),
      );
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementation(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });

  it('Should instance start with default', async () => {
    jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockResolvedValueOnce('Go back');
    jest.spyOn(WizardService.prototype, 'mainMenu');
    WizardService.prototype.mainMenu = jest.fn().mockImplementation();

    const keep = service.start;
    jest
      .spyOn(service, 'start')
      .mockImplementationOnce(keep)
      .mockImplementationOnce(jest.fn());

    await service.start();

    expect(service).not.toBeNull();
    expect(utilsService.cleanAndShowBanner).toHaveBeenCalled();
    expect(utilsService.showMessage).toHaveBeenCalledWith(
      language.getText('general.newLine'),
    );
  });
});
