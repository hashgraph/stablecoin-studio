import {
  configurationService,
  setConfigurationService,
  setMirrorNodeService,
  utilsService,
  wizardService,
} from '../../../../src/index.js';
import { IConfiguration } from '../../../../src/domain/configuration/interfaces/IConfiguration.js';
import Language from '../../../../src/domain/language/Language.js';
import { rimraf } from 'rimraf';
import { AccountType } from '../../../../src/domain/configuration/interfaces/AccountType';
import fs from 'fs-extra';

const language: Language = new Language();
const testDir = 'test';
const path = `${testDir}/hsca-config_test.yaml`;

describe('setConfigurationService', () => {
  const configurationMock: IConfiguration = {
    defaultNetwork: 'testnet',
    networks: [
      {
        name: 'testnet',
        chainId: 1,
        consensusNodes: [],
      },
    ],
    accounts: [
      {
        accountId: '0.0.123456',
        type: AccountType.SelfCustodial,
        selfCustodial: {
          privateKey: {
            key: '01234567890abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcde',
            type: 'ED25519',
          },
        },
        network: 'testnet',
        alias: 'test account',
        importedTokens: [],
      },
    ],
    logs: {
      path: './logs',
      level: 'ERROR',
    },
    rpcs: [
      {
        name: 'HASHIO',
        network: 'testnet',
        baseUrl: 'https://testnet.hashio.io/api',
        apiKey: '',
        headerName: '',
        selected: true,
      },
    ],
    factories: [
      {
        id: '0.0.13579',
        network: 'testnet',
      },
      {
        id: '0.0.02468',
        network: 'previewnet',
      },
    ],
    mirrors: [
      {
        name: 'HEDERA',
        network: 'testnet',
        baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
        apiKey: '',
        headerName: '',
        selected: true,
      },
    ],
  };

  beforeEach(() => {
    jest
      .spyOn(configurationService, 'getConfiguration')
      .mockReturnValue(configurationMock);
    jest.spyOn(utilsService, 'showSpinner').mockImplementation();
    jest.spyOn(console, 'log');
  });

  it('should init configuration with no file path nor network', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve(path))
      .mockImplementationOnce(() => Promise.resolve('wrong account id format'))
      .mockImplementationOnce(() => Promise.resolve('0.0.654321'))
      .mockImplementationOnce(() => Promise.resolve('test account'))
      .mockImplementationOnce(() => Promise.resolve('another test account'));

    const defaultPasswordAskMock = jest
      .spyOn(utilsService, 'defaultPasswordAsk')
      .mockImplementationOnce(() => Promise.resolve('wrong private key format'))
      .mockImplementationOnce(() =>
        Promise.resolve(
          'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        ),
      );

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askCreateConfig'):
            return Promise.resolve(true);

          case language.getText('configuration.askMoreAccounts'):
            return Promise.resolve(false);

          case language.getText('configuration.askConfigurateFactories'):
            return Promise.resolve(false);

          case language.getText(
            'configuration.askConfigurateDefaultMirrorsAndRPCs',
          ):
            return Promise.resolve(true);

          default:
            return Promise.resolve(false);
        }
      });

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve('testnet'))
      .mockImplementationOnce(() => Promise.resolve('ED25519'))
      .mockImplementationOnce(() => Promise.resolve('ED25519'))
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    setConfigurationService.initConfiguration();

    expect(setConfigurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(1);
    expect(defaultPasswordAskMock).toHaveBeenCalledTimes(0);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(0);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should init configuration with file path and network', async () => {
    jest
      .spyOn(configurationService, 'validateConfigurationFile')
      .mockReturnValue(false);

    jest
      .spyOn(setMirrorNodeService, 'configureMirrors')
      .mockReturnValue(Promise.resolve(configurationMock.mirrors));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve(path))
      .mockImplementationOnce(() => Promise.resolve('0.0.765432'))
      .mockImplementationOnce(() => Promise.resolve('one more test account'))
      .mockImplementationOnce(() => Promise.resolve('0.0.2'))
      .mockImplementationOnce(() => Promise.resolve('0.0.3'));

    const defaultPasswordAskMock = jest
      .spyOn(utilsService, 'defaultPasswordAsk')
      .mockImplementationOnce(() => Promise.resolve('wrong private key format'))
      .mockImplementationOnce(() =>
        Promise.resolve(
          'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789',
        ),
      );

    const defaultConfirmAskMock = jest
      .spyOn(utilsService, 'defaultConfirmAsk')
      .mockImplementation((question: string) => {
        switch (question) {
          case language.getText('configuration.askCreateConfig'):
            return Promise.resolve(true);

          case language.getText('configuration.askMoreAccounts'):
            return Promise.resolve(false);

          case language.getText('configuration.askConfigurateFactories'):
            return Promise.resolve(true);

          case language.getText(
            'configuration.askConfigurateDefaultMirrorsAndRPCs',
          ):
            return Promise.resolve(false);

          default:
            return Promise.resolve(false);
        }
      });

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve('testnet'))
      .mockImplementationOnce(() => Promise.resolve('ED25519'))
      .mockImplementationOnce(() => Promise.resolve('ED25519'))
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    setConfigurationService.initConfiguration(path, 'testnet');

    expect(setConfigurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultPasswordAskMock).toHaveBeenCalledTimes(0);
    expect(defaultConfirmAskMock).toHaveBeenCalledTimes(1);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should configure custom network from default network', async () => {
    jest
      .spyOn(setConfigurationService, 'configureCustomNetwork')
      .mockReturnValue(Promise.resolve(configurationMock.networks[0]));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('y'));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve('other net'))
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    setConfigurationService.configureDefaultNetwork('testnet');

    expect(setConfigurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should configure default network', async () => {
    jest
      .spyOn(setConfigurationService, 'configureCustomNetwork')
      .mockReturnValue(Promise.resolve(configurationMock.networks[0]));

    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('n'));

    const defaultMultipleAskMock = jest
      .spyOn(utilsService, 'defaultMultipleAsk')
      .mockImplementationOnce(() => Promise.resolve('other net'))
      .mockImplementationOnce(() => Promise.resolve('testnet'));

    setConfigurationService.configureDefaultNetwork('testnet');

    expect(setConfigurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(0);
    expect(defaultMultipleAskMock).toHaveBeenCalledTimes(0);
  });

  it('should configure custom network', async () => {
    const defaultSingleAskMock = jest
      .spyOn(utilsService, 'defaultSingleAsk')
      .mockImplementationOnce(() => Promise.resolve('127.0.0.1:50211'))
      .mockImplementationOnce(() => Promise.resolve('0.0.1'))
      .mockImplementationOnce(() => Promise.resolve('n'))
      .mockImplementationOnce(() => Promise.resolve('0'));

    setConfigurationService.configureCustomNetwork('testnet');

    expect(setConfigurationService).not.toBeNull();
    expect(defaultSingleAskMock).toHaveBeenCalledTimes(1);
  });

  it('should configure default mirrors and RPCs', async () => {
    setConfigurationService.configureDefaultMirrorsAndRPCs();
    const conf: IConfiguration = configurationService.getConfiguration();

    expect(setConfigurationService).not.toBeNull();
    expect(conf.mirrors).toBe(configurationMock.mirrors);
    expect(conf.rpcs).toBe(configurationMock.rpcs);
  });

  describe('Account configuration', () => {
    beforeEach(async () => {
      jest
        .spyOn(configurationService, 'getDefaultConfigurationPath')
        .mockReturnValue(path);

      jest
        .spyOn(utilsService, 'getCurrentAccount')
        .mockReturnValue(configurationMock.accounts[0]);

      jest
        .spyOn(utilsService, 'getCurrentMirror')
        .mockReturnValue(configurationMock.mirrors[0]);

      jest
        .spyOn(utilsService, 'getCurrentRPC')
        .mockReturnValue(configurationMock.rpcs[0]);

      jest.spyOn(utilsService, 'initSDK').mockImplementation(jest.fn());

      jest.spyOn(wizardService, 'mainMenu').mockImplementation(jest.fn());
    });

    const buildInitDefaultMultipleAsk = (
      accountType: string,
    ): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultMultipleAsk')
        .mockImplementationOnce(() =>
          Promise.resolve(language.getText('wizard.manageAccountOptions.List')),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(language.getText('wizard.manageAccountOptions.Add')),
        )
        .mockImplementationOnce(() => Promise.resolve(accountType))
        .mockImplementationOnce(() => Promise.resolve('testnet'));
    };

    const buildDefaultMultipleAskMock = (
      accountType: string,
    ): jest.SpyInstance => {
      return buildInitDefaultMultipleAsk(accountType)
        .mockImplementationOnce(() => Promise.resolve('ED25519'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            language.getText('wizard.manageAccountOptions.Change'),
          ),
        )
        .mockImplementationOnce(() => Promise.resolve('0.0.456789'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            language.getText('wizard.manageAccountOptions.Delete'),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            `0.0.456789 - Account alias ${accountType} (testnet)`,
          ),
        );
    };

    const buildDefaultMultipleAskNonCustodial = (
      accountType: string,
    ): jest.SpyInstance => {
      return buildInitDefaultMultipleAsk(accountType)
        .mockImplementationOnce(() =>
          Promise.resolve(
            language.getText('wizard.manageAccountOptions.Change'),
          ),
        )
        .mockImplementationOnce(() => Promise.resolve('0.0.456789'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            language.getText('wizard.manageAccountOptions.Delete'),
          ),
        )
        .mockImplementationOnce(() =>
          Promise.resolve(
            `0.0.456789 - Account alias ${accountType} (testnet)`,
          ),
        );
    };

    const buildDefaultSingleAskMock = (
      accountType: string,
    ): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultSingleAsk')
        .mockImplementationOnce(() => Promise.resolve('0.0.456789'))
        .mockImplementationOnce(() =>
          Promise.resolve(`Account alias ${accountType}`),
        );
    };

    const buildDefaultPasswordAskMock = (): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultPasswordAsk')
        .mockImplementationOnce(() =>
          Promise.resolve(
            'bcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789a',
          ),
        );
    };

    const buildDefaultConfirmAskMock = (): jest.SpyInstance => {
      return jest
        .spyOn(utilsService, 'defaultConfirmAsk')
        .mockImplementationOnce(() => Promise.resolve(false))
        .mockImplementationOnce(() => Promise.resolve(false));
    };

    it('should manage account menu for self custodial accounts', async () => {
      const accountType = 'SELF-CUSTODIAL';
      const defaultMultipleAskMock = buildDefaultMultipleAskMock(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType);
      const defaultPasswordAskMock = buildDefaultPasswordAskMock();
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();

      const keep = setConfigurationService.manageAccountMenu;
      jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(9);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(2);
      expect(defaultPasswordAskMock).toHaveBeenCalledTimes(1);
    });

    it('should manage account menu for non-custodial Firebloks', async () => {
      const accountType = 'FIREBLOCKS';
      const defaultMultipleAskMock =
        buildDefaultMultipleAskNonCustodial(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType)
        .mockImplementationOnce(() =>
          Promise.resolve(language.getText('configuration.fireblocks.title')),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('/user/foo/keystore/key.pem'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('bbe6a358-0c98-460a-a2fc-91e035f74d54'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('https://api.fireblocks.io'),
        )
        .mockImplementationOnce(() => Promise.resolve('HBAR_TEST'))
        .mockImplementationOnce(() => Promise.resolve('2'))
        .mockImplementationOnce(() => Promise.resolve('0.0.5712904'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
          ),
        );
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();
      const privateKeyPathValidation = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => true);

      const keep = setConfigurationService.manageAccountMenu;
      jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(8);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(10);
      expect(privateKeyPathValidation).toHaveBeenCalledTimes(1);
    });

    it('should manage account menu for non-custodial Dfns', async () => {
      const accountType = 'DFNS';
      const defaultMultipleAskMock =
        buildDefaultMultipleAskNonCustodial(accountType);
      const defaultSingleAskMock = buildDefaultSingleAskMock(accountType)
        .mockImplementationOnce(() =>
          Promise.resolve('Y2ktMTZ2NTMtZXF0ZzAtOWRvOXJub3NjbGI1a3RwYg'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('/user/foo/keystore/key.pem'),
        )
        .mockImplementationOnce(() => Promise.resolve('https://localhost:3000'))
        .mockImplementationOnce(() =>
          Promise.resolve('ap-2ng9jv-80cfc-983pop0iauf2sv8r'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('https://api.dfns.ninja/'),
        )
        .mockImplementationOnce(() =>
          Promise.resolve('wa-6qfr0-heg0c-985bmvv9hphbok47'),
        )
        .mockImplementationOnce(() => Promise.resolve('0.0.50000'))
        .mockImplementationOnce(() =>
          Promise.resolve(
            '04eb152576e3af4dccbabda7026b85d8fdc0ad3f18f26540e42ac71a08e21623',
          ),
        );
      const defaultPasswordAskMock = buildDefaultPasswordAskMock();
      const defaultConfirmAskMock = buildDefaultConfirmAskMock();
      const privateKeyPathValidation = jest
        .spyOn(fs, 'existsSync')
        .mockImplementationOnce(() => true);

      const keep = setConfigurationService.manageAccountMenu;
      jest
        .spyOn(setConfigurationService, 'manageAccountMenu')
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementationOnce(keep)
        .mockImplementation(jest.fn());

      await setConfigurationService.manageAccountMenu();

      expect(setConfigurationService).not.toBeNull();
      expect(defaultMultipleAskMock).toHaveBeenCalledTimes(8);
      expect(defaultConfirmAskMock).toHaveBeenCalledTimes(2);
      expect(defaultSingleAskMock).toHaveBeenCalledTimes(10);
      expect(defaultPasswordAskMock).toHaveBeenCalledTimes(1);
      expect(privateKeyPathValidation).toHaveBeenCalledTimes(1);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    rimraf(path);
  });
});
