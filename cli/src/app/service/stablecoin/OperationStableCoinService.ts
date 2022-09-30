import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import { SDK, StableCoin, StableCoinRole } from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RoleStableCoinsService from './RoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import colors from 'colors';
import CapabilitiesStableCoinsService from './CapabilitiesStableCoinService.js';
import BurnStableCoinsService from './BurnStableCoinService.js';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private proxyContractId;
  private stableCoinWithSymbol;

  constructor(tokenId?: string, memo?: string, symbol?: string) {
    super('Operation Stable Coin');
    if (tokenId && memo && symbol) {
      this.stableCoinId = tokenId.toString(); //TODO Cambiar name por el id que llegue en la creación del token
      this.proxyContractId = memo;
      this.stableCoinWithSymbol = `${tokenId.toString()} - ${symbol}`;
    }
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();
    let resp: StableCoinList[];
    if (this.stableCoinId === undefined) {
      //Get list of stable coins to display
      await utilsService.showSpinner(
        sdk
          .getListStableCoin({
            privateKey: currentAccount.privateKey,
          })
          .then((response: StableCoinList[]) => (resp = response)),
        {
          text: language.getText('state.searching'),
          successText: language.getText('state.searchingSuccess') + '\n',
        },
      );

      this.stableCoinId = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askToken'),
        resp.map((item) => {
          return `${item.id} - ${item.symbol}`;
        }),
        true,
        configurationService.getConfiguration()?.defaultNetwork,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
      );
      this.stableCoinWithSymbol = this.stableCoinId;
      this.stableCoinId = this.stableCoinId.split(' - ')[0];

      if (this.stableCoinId === language.getText('wizard.backOption')) {
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
      } else {
        // Get details to obtain treasury
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(this.stableCoinId, false)
          .then((response: StableCoin) => {
            this.proxyContractId = response.memo;
          });

        await utilsService.cleanAndShowBanner();
        await this.operationsStableCoin();
      }
    } else {
      await utilsService.cleanAndShowBanner();
      await this.operationsStableCoin();
    }
  }

  private async operationsStableCoin(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();
    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    const capabilitiesStableCoin =
      await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
        this.stableCoinId,
        sdk.getPublicKey(currentAccount.privateKey),
      );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething'),
        this.filterMenuOptions(
          wizardOperationsStableCoinOptions,
          capabilitiesStableCoin,
        ),
        false,
        currentAccount.network,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
        this.stableCoinWithSymbol,
      )
    ) {
      case 'Cash in':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );
        // Call to mint
        const account2Mint = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        if (!sdk.checkIsAddress(account2Mint)) {
          console.log(language.getText('validations.wrongFormatAddress'));

          await this.operationsStableCoin();
        }

        const amount2Mint = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askCashInAmount'), '1')
          .then((val) => val.replace(',', '.'));

        if (parseFloat(amount2Mint) < 0) {
          console.log(language.getText('account.wrong'));
          await this.operationsStableCoin();
        }
        try {
          await new CashInStableCoinsService().cashInStableCoin(
            this.proxyContractId,
            currentAccount.privateKey,
            currentAccount.accountId,
            this.stableCoinId,
            account2Mint,
            parseFloat(amount2Mint),
          );
        } catch (error) {
          console.log(colors.red(error.message));
          await this.operationsStableCoin();
        }

        break;
      case 'Details':
        await utilsService.cleanAndShowBanner();

        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case 'Balance':
        await utilsService.cleanAndShowBanner();

        // Call to balance
        const targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askAccountToBalance'),
          currentAccount.accountId,
        );
        // Check Address
        if (sdk.checkIsAddress(targetId)) {
          await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
            this.proxyContractId,
            currentAccount.privateKey,
            currentAccount.accountId,
            targetId,
            this.stableCoinId,
          );
        } else {
          console.log(language.getText('validations.wrongFormatAddress'));

          await this.operationsStableCoin();
        }

        break;
      case 'Burn':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        const amount2Burn = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askBurnAmount'), '1')
          .then((val) => val.replace(',', '.'));
        try {
          await new BurnStableCoinsService().burnStableCoin(
            this.proxyContractId,
            configurationService.getConfiguration().accounts[0].privateKey,
            configurationService.getConfiguration().accounts[0].accountId,
            this.stableCoinId,
            parseFloat(amount2Burn),
          );
        } catch (error) {
          console.log(colors.red(error.message));
          await this.operationsStableCoin();
        }

        break;
      case 'Wipe':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        // Call to Wipe
        const account2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        if (!sdk.checkIsAddress(account2Wipe)) {
          console.log(language.getText('validations.wrongFormatAddress'));
          await this.operationsStableCoin();
        }
        const amount2Wipe = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askWipeAmount'), '1')
          .then((val) => val.replace(',', '.'));
        if (parseFloat(amount2Wipe) < 0) {
          console.log(language.getText('validations.wrongFormatAddress'));
          await this.operationsStableCoin();
        }

        try {
          await new WipeStableCoinsService().wipeStableCoin(
            this.proxyContractId,
            currentAccount.privateKey,
            currentAccount.accountId,
            this.stableCoinId,
            account2Wipe,
            parseFloat(amount2Wipe),
          );
        } catch (error) {
          console.log(colors.red(error.message));
          await this.operationsStableCoin();
        }

        break;
      case 'Rescue':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        // Call to Rescue
        const amount2Rescue = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askRescueAmount'), '1')
          .then((val) => val.replace(',', '.'));

        if (parseFloat(amount2Rescue) <= 0) {
          console.log(language.getText('validations.lessZero'));
          utilsService.breakLine();

          await this.operationsStableCoin();
        }

        try {
          await new RescueStableCoinsService().rescueStableCoin(
            this.proxyContractId,
            currentAccount.privateKey,
            currentAccount.accountId,
            this.stableCoinId,
            parseFloat(amount2Rescue),
          );
        } catch (err) {
          console.log(colors.red(err.message));
          await this.operationsStableCoin();
        }

        console.log(
          language
            .getText('rescue.success')
            .replace('${tokens}', amount2Rescue),
        );

        utilsService.breakLine();

        // Call to balance
        await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
          this.proxyContractId,
          currentAccount.privateKey,
          currentAccount.accountId,
          currentAccount.accountId,
          this.stableCoinId,
        );

        break;
      case 'Role management':
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        await this.roleManagementFlow();
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
    }

    await this.operationsStableCoin();
  }

  /**
   * RoleManagement Flow
   */

  private async roleManagementFlow(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const currentAccount = utilsService.getCurrentAccount();
    const roleManagementOptions = language.getArray(
      'wizard.roleManagementOptions',
    );

    let accountTarget = '0.0.0';
    let limit = '';
    const roleService = new RoleStableCoinsService();

    let role: string;
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditSupplierRole'),
        roleManagementOptions,
        false,
        currentAccount.network,
        `${currentAccount.accountId} - ${currentAccount.alias}`,
        this.stableCoinWithSymbol,
      )
    ) {
      case roleManagementOptions[0]:
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        // Grant role
        //Lists all roles
        role = await this.getRole();
        if (role !== language.getText('wizard.backOption')) {
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          while (!sdk.checkIsAddress(accountTarget)) {
            console.log(language.getText('validations.wrongFormatAddress'));
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              '0.0.0',
            );
          }

          if (StableCoinRole[role] === StableCoinRole.SUPPLIER_ROLE) {
            await this.grantSupplierRole(
              accountTarget,
              roleService,
              currentAccount,
            );
            break;
          }

          //Call to SDK
          await roleService.grantRoleStableCoin(
            this.proxyContractId,
            this.stableCoinId,
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[1]:
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        // Revoke role
        //Lists all roles
        role = await this.getRole();
        if (role !== language.getText('wizard.backOption')) {
          //Call to revoke role
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          while (!sdk.checkIsAddress(accountTarget)) {
            console.log(language.getText('validations.wrongFormatAddress'));
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              '0.0.0',
            );
          }
          //Call to SDK
          await roleService.revokeRoleStableCoin(
            this.proxyContractId,
            this.stableCoinId,
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[2]:
        await utilsService.cleanAndShowBanner();

        //Call to edit role
        const editOptions = language.getArray('roleManagement.editAction');
        switch (
          await utilsService.defaultMultipleAsk(
            language.getText('roleManagement.askRole'),
            editOptions,
            false,
            currentAccount.network,
            `${currentAccount.accountId} - ${currentAccount.alias}`,
            this.stableCoinWithSymbol,
          )
        ) {
          case editOptions[0]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              currentAccount,
              this.stableCoinWithSymbol,
            );

            //Increase limit
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              accountTarget,
            );
            while (!sdk.checkIsAddress(accountTarget)) {
              console.log(language.getText('validations.wrongFormatAddress'));
              accountTarget = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                '0.0.0',
              );
            }

            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'unlimited',
                currentAccount,
              )
            ) {
              console.log(language.getText('supplier.unlimitedRole') + '\n');
              break;
            }
            do {
              limit = await utilsService
                .defaultSingleAsk(
                  language.getText('stablecoin.amountIncrease'),
                  '1',
                )
                .then((val) => val.replace(',', '.'));
              if (parseFloat(limit) <= 0) {
                console.log(language.getText('validations.lessZero'));
              }
            } while (parseFloat(limit) <= 0);
            //Call to SDK

            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'limited',
                currentAccount,
              )
            ) {
              await roleService.increaseLimitSupplierRoleStableCoin(
                this.proxyContractId,
                this.stableCoinId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
                parseFloat(limit),
              );

              await roleService.getSupplierAllowance(
                this.proxyContractId,
                this.stableCoinId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
              );
            } else {
              console.log(language.getText('supplier.notRole'));
            }
            break;
          case editOptions[1]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              currentAccount,
              this.stableCoinWithSymbol,
            );

            //Decrease limit
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              accountTarget,
            );
            while (!sdk.checkIsAddress(accountTarget)) {
              console.log(language.getText('validations.wrongFormatAddress'));
              accountTarget = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                '0.0.0',
              );
            }
            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'unlimited',
                currentAccount,
              )
            ) {
              console.log(language.getText('supplier.unlimitedRole') + '\n');
              break;
            }
            do {
              limit = await utilsService
                .defaultSingleAsk(
                  language.getText('stablecoin.amountDecrease'),
                  '1',
                )
                .then((val) => val.replace(',', '.'));
              if (parseFloat(limit) <= 0) {
                console.log(language.getText('validations.lessZero'));
              }
            } while (parseFloat(limit) <= 0);
            //Call to SDK
            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'limited',
                currentAccount,
              )
            ) {
              try {
                await roleService.decreaseLimitSupplierRoleStableCoin(
                  this.proxyContractId,
                  this.stableCoinId,
                  accountTarget,
                  currentAccount.privateKey,
                  currentAccount.accountId,
                  parseFloat(limit),
                );

                await roleService.getSupplierAllowance(
                  this.proxyContractId,
                  this.stableCoinId,
                  accountTarget,
                  currentAccount.privateKey,
                  currentAccount.accountId,
                );
              } catch (e) {
                console.log(colors.red(e.message));
              }
            } else {
              console.log(language.getText('supplier.notRole'));
            }
            break;
          case editOptions[2]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              currentAccount,
              this.stableCoinWithSymbol,
            );

            //Reset
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              accountTarget,
            );
            while (!sdk.checkIsAddress(accountTarget)) {
              console.log(language.getText('validations.wrongFormatAddress'));
              accountTarget = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                '0.0.0',
              );
            }
            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'unlimited',
                currentAccount,
              )
            ) {
              console.log(language.getText('supplier.unlimitedRole') + '\n');
              break;
            }
            //Call to SDK
            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'limited',
                currentAccount,
              )
            ) {
              await roleService.resetLimitSupplierRoleStableCoin(
                this.proxyContractId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
              );

              await roleService.getSupplierAllowance(
                this.proxyContractId,
                this.stableCoinId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
              );
            } else {
              console.log(language.getText('supplier.notRole'));
            }
            break;
          case editOptions[3]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              currentAccount,
              this.stableCoinWithSymbol,
            );

            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              accountTarget,
            );
            while (!sdk.checkIsAddress(accountTarget)) {
              console.log(language.getText('validations.wrongFormatAddress'));
              accountTarget = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                '0.0.0',
              );
            }
            if (
              await this.checkSupplierType(
                accountTarget,
                roleService,
                'unlimited',
                currentAccount,
              )
            ) {
              const response = language.getText(
                'roleManagement.accountHasRoleSupplierUnlimited',
              );

              console.log(response.replace('${address}', accountTarget) + '\n');
              break;
            }
            await roleService.getSupplierAllowance(
              this.proxyContractId,
              this.stableCoinId,
              accountTarget,
              currentAccount.privateKey,
              currentAccount.accountId,
            );

            break;
          case editOptions[editOptions.length - 1]:
          default:
            await utilsService.cleanAndShowBanner();

            await this.roleManagementFlow();
        }
        break;
      case roleManagementOptions[3]:
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          currentAccount,
          this.stableCoinWithSymbol,
        );

        //Lists all roles
        role = await this.getRole();
        if (role !== language.getText('wizard.backOption')) {
          //Call to has role
          accountTarget = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          while (!sdk.checkIsAddress(accountTarget)) {
            console.log(language.getText('validations.wrongFormatAddress'));
            accountTarget = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.accountTarget'),
              '0.0.0',
            );
          }
          //Call to SDK
          await roleService.hasRoleStableCoin(
            this.proxyContractId,
            this.stableCoinId,
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[roleManagementOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();

        await this.operationsStableCoin();
    }
    await this.roleManagementFlow();
  }

  private filterMenuOptions(
    options: string[],
    capabilities: string[],
  ): string[] {
    if (capabilities.length === 0) return options;

    capabilities = capabilities.concat('Return to main menu');

    return options.filter((option) => {
      if (
        (option === 'Cash in' &&
          (capabilities.includes('Cash in') ||
            capabilities.includes('Cash in hts'))) ||
        (option === 'Burn' &&
          (capabilities.includes('Burn') ||
            capabilities.includes('Burn hts'))) ||
        (option === 'Wipe' &&
          (capabilities.includes('Wipe') || capabilities.includes('Wipe hts')))
      ) {
        return true;
      }

      return capabilities.includes(option);
    });
  }

  private async getRole(): Promise<string> {
    return await utilsService.defaultMultipleAsk(
      language.getText('roleManagement.askRole'),
      Object.keys(StableCoinRole),
      true,
    );
  }

  private async grantSupplierRole(
    accountTarget: string,
    roleService: RoleStableCoinsService,
    currentAccount,
  ): Promise<void> {
    let limit = '';
    const supplierRoleType = language.getArray('wizard.supplierRoleType');

    const roleType = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askSupplierRoleType'),
      supplierRoleType,
    );
    if (roleType === supplierRoleType[supplierRoleType.length - 1])
      await this.roleManagementFlow();
    if (roleType === supplierRoleType[0]) {
      //Give unlimited
      //Call to SDK
      if (
        await this.checkSupplierType(
          accountTarget,
          roleService,
          'unlimited',
          currentAccount,
        )
      ) {
        console.log(language.getText('supplier.alreadyUnlimitedRole'));
      }

      await roleService.giveSupplierRoleStableCoin(
        this.proxyContractId,
        this.stableCoinId,
        accountTarget,
        currentAccount.privateKey,
        currentAccount.accountId,
        'unlimited',
      );
    }
    if (roleType === supplierRoleType[1]) {
      //Give limited
      limit = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.supplierRoleLimit'),
        '1',
      );
      //Call to SDK
      if (
        await this.checkSupplierType(
          accountTarget,
          roleService,
          'limited',
          currentAccount,
        )
      ) {
        console.log(language.getText('supplier.alreadyRole'));
      }

      await roleService.giveSupplierRoleStableCoin(
        this.proxyContractId,
        this.stableCoinId,
        accountTarget,
        currentAccount.privateKey,
        currentAccount.accountId,
        'limited',
        parseInt(limit),
      );
    }
  }

  private async checkSupplierType(
    accountTarget: string,
    roleService: RoleStableCoinsService,
    supplierType: string,
    currentAccount,
  ): Promise<boolean> {
    return await roleService.checkSupplierRoleStableCoin(
      this.proxyContractId,
      accountTarget,
      currentAccount.privateKey,
      currentAccount.accountId,
      supplierType,
    );
  }
}
