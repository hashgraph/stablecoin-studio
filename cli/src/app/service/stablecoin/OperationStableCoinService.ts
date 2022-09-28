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
import CashOutStableCoinsService from './CashOutStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RoleStableCoinsService from './RoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import colors from 'colors';
import CapabilitiesStableCoinsService from './CapabilitiesStableCoinService.js';

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
        await wizardService.mainMenu();
      } else {
        // Get details to obtain treasury
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(this.stableCoinId, false)
          .then((response: StableCoin) => {
            this.proxyContractId = response.memo;
          });

        await this.operationsStableCoin();
      }
    } else {
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
        // Call to mint
        const account2Mint = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        if (!sdk.checkIsAddress(account2Mint)) {
          console.log(language.getText('validations.wrongFormatAddress'));

          await this.operationsStableCoin();
        }
        const amount2Mint = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askCashInAmount'),
          '1',
        );
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
        // Call to details
        await new DetailsStableCoinsService().getDetailsStableCoins(
          this.stableCoinId,
        );
        break;
      case 'Balance':
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
      case 'Cash out':
        const amount2Burn = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askCashOutAmount'),
          '1',
        );
        try {
          await new CashOutStableCoinsService().cashOutStableCoin(
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
        // Call to Wipe
        const account2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId,
        );
        if (!sdk.checkIsAddress(account2Wipe)) {
          console.log(language.getText('validations.wrongFormatAddress'));
          await this.operationsStableCoin();
        }
        const amount2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askWipeAmount'),
          '1',
        );
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
        // Call to Rescue
        const amount2Rescue = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askRescueAmount'),
          '1',
        );

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
        // Call to Supplier Role
        await this.roleManagementFlow();
        break;
      case wizardOperationsStableCoinOptions[
        wizardOperationsStableCoinOptions.length - 1
      ]:
      default:
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
      )
    ) {
      case roleManagementOptions[0]:
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
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[1]:
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
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[2]:
        //Call to edit role
        const editOptions = language.getArray('roleManagement.editAction');
        switch (
          await utilsService.defaultMultipleAsk(
            language.getText('roleManagement.askRole'),
            editOptions,
          )
        ) {
          case editOptions[0]:
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
            limit = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.amountIncrease'),
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
              await roleService.increaseLimitSupplierRoleStableCoin(
                this.proxyContractId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
                parseInt(limit),
              );

              await roleService.getSupplierAllowance(
                this.proxyContractId,
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
              );
            } else {
              console.log(language.getText('supplier.notRole'));
            }
            break;
          case editOptions[1]:
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
            limit = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.amountDecrease'),
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
              try {
                await roleService.decreaseLimitSupplierRoleStableCoin(
                  this.proxyContractId,
                  accountTarget,
                  currentAccount.privateKey,
                  currentAccount.accountId,
                  parseInt(limit),
                );

                await roleService.getSupplierAllowance(
                  this.proxyContractId,
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
                accountTarget,
                currentAccount.privateKey,
                currentAccount.accountId,
              );
            } else {
              console.log(language.getText('supplier.notRole'));
            }
            break;
          case editOptions[3]:
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
              accountTarget,
              currentAccount.privateKey,
              currentAccount.accountId,
            );

            break;
          case editOptions[editOptions.length - 1]:
          default:
            await this.roleManagementFlow();
        }
        break;
      case roleManagementOptions[3]:
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
            accountTarget,
            currentAccount.privateKey,
            currentAccount.accountId,
            role,
          );
        }
        break;
      case roleManagementOptions[roleManagementOptions.length - 1]:
      default:
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
        (option === 'Cash out' &&
          (capabilities.includes('Cash out') ||
            capabilities.includes('Cash out hts'))) ||
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
