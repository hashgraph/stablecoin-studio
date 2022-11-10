import { StableCoinList } from '../../../domain/stablecoin/StableCoinList.js';
import {
  language,
  utilsService,
  wizardService,
  configurationService,
} from '../../../index.js';
import Service from '../Service.js';
import DetailsStableCoinsService from './DetailsStableCoinService.js';
import {
  Capabilities,
  EOAccount,
  IStableCoinDetail,
  PrivateKey,
  SDK,
  StableCoinRole,
  StableCoinMemo,
  CashInStableCoinRequest,
  CashOutStableCoinRequest,
  GetListStableCoin,
  GrantRoleRequest,
  RevokeRoleRequest,
  HasRoleRequest,
  CheckCashInRoleRequest,
  CheckCashInLimitRequest,
  ResetCashInLimitRequest,
  IncreaseCashInLimitRequest,
  DecreaseCashInLimitRequest,
} from 'hedera-stable-coin-sdk';
import BalanceOfStableCoinsService from './BalanceOfStableCoinService.js';
import CashInStableCoinsService from './CashInStableCoinService.js';
import WipeStableCoinsService from './WipeStableCoinService.js';
import RoleStableCoinsService from './RoleStableCoinService.js';
import RescueStableCoinsService from './RescueStableCoinService.js';
import colors from 'colors';
import CapabilitiesStableCoinsService from './CapabilitiesStableCoinService.js';
import BurnStableCoinsService from './BurnStableCoinService.js';
import ManageExternalTokenService from './ManageExternalTokenService';

/**
 * Operation Stable Coin Service
 */
export default class OperationStableCoinService extends Service {
  private stableCoinId;
  private proxyContractId;
  private stableCoinWithSymbol;
  private optionTokenListSelected;
  private roleStableCoinService = new RoleStableCoinsService();

  constructor(tokenId?: string, memo?: StableCoinMemo, symbol?: string) {
    super('Operation Stable Coin');
    if (tokenId && memo && symbol) {
      this.stableCoinId = tokenId; //TODO Cambiar name por el id que llegue en la creación del token
      this.proxyContractId = memo.proxyContract;
      this.stableCoinWithSymbol = `${tokenId} - ${symbol}`;
    }
  }

  /**
   * Start the wizard for operation a stable coin
   */
  public async start(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const configAccount = utilsService.getCurrentAccount();
    const currentAccount = new EOAccount(
      configAccount.accountId,
      new PrivateKey(
        configAccount.privateKey.key,
        configAccount.privateKey.type,
      ),
    );
    let resp: StableCoinList[];
    if (this.stableCoinId === undefined) {
      //Get list of stable coins to display
      await utilsService.showSpinner(
        sdk
          .getListStableCoin(
            new GetListStableCoin({
              account: {
                accountId: currentAccount.accountId.id,
              },
            }),
          )
          .then((response: StableCoinList[]) => (resp = response)),
        {
          text: language.getText('state.searching'),
          successText: language.getText('state.searchingSuccess') + '\n',
        },
      );

      this.stableCoinId = await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askToken'),
        new ManageExternalTokenService().mixExternalTokens(
          resp.map((item) => {
            return `${item.id} - ${item.symbol}`;
          }),
        ),
        true,
        configurationService.getConfiguration()?.defaultNetwork,
        `${currentAccount.accountId.id} - ${configAccount.alias}`,
      );
      this.optionTokenListSelected = this.stableCoinId;
      this.stableCoinWithSymbol =
        this.stableCoinId.split(' - ').length === 3
          ? `${this.stableCoinId.split(' - ')[0]} - ${
              this.stableCoinId.split(' - ')[1]
            }`
          : this.stableCoinId;
      this.stableCoinId = this.stableCoinId.split(' - ')[0];

      if (this.stableCoinId === language.getText('wizard.goBack')) {
        await utilsService.cleanAndShowBanner();
        await wizardService.mainMenu();
      } else {
        // Get details to obtain treasury
        await new DetailsStableCoinsService()
          .getDetailsStableCoins(this.stableCoinId, false)
          .then((response: IStableCoinDetail) => {
            this.proxyContractId = response.memo.proxyContract;
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
    const configAccount = utilsService.getCurrentAccount();
    const currentAccount = new EOAccount(
      configAccount.accountId,
      new PrivateKey(
        configAccount.privateKey.key,
        configAccount.privateKey.type,
      ),
    );
    const wizardOperationsStableCoinOptions = language.getArray(
      'wizard.stableCoinOptions',
    );

    const capabilitiesStableCoin = await this.getCapabilities(
      sdk,
      currentAccount,
    );

    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askDoSomething'),
        this.filterMenuOptions(
          wizardOperationsStableCoinOptions,
          capabilitiesStableCoin,
          this.optionTokenListSelected &&
            this.optionTokenListSelected.split(' - ').length === 3
            ? configAccount.externalTokens.find(
                (token) => token.id === this.stableCoinId,
              ).roles
            : undefined,
        ),
        false,
        configAccount.network,
        `${currentAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
      )
    ) {
      case 'Cash in':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashInRequest = new CashInStableCoinRequest({
          proxyContractId: this.proxyContractId,
          account: {
            accountId: configAccount.accountId,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to mint
        cashInRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId.id,
        );
        await utilsService.handleValidation(
          () => cashInRequest.validate('targetId'),
          async () => {
            cashInRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId.id,
            );
          },
        );

        cashInRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askCashInAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => cashInRequest.validate('amount'),
          async () => {
            cashInRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askTargetAccount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );
        try {
          await new CashInStableCoinsService().cashInStableCoin(cashInRequest);
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
          configAccount.accountId,
        );
        // Check Address
        if (sdk.checkIsAddress(targetId)) {
          await new BalanceOfStableCoinsService().getBalanceOfStableCoin(
            this.proxyContractId,
            currentAccount,
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
          configAccount,
          this.stableCoinWithSymbol,
        );

        const cashOutRequest = new CashOutStableCoinRequest({
          proxyContractId: this.proxyContractId,
          account: {
            accountId: configAccount.accountId,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          tokenId: this.stableCoinId,
          targetId: '',
          amount: '',
        });

        // Call to cash out
        cashOutRequest.targetId = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          currentAccount.accountId.id,
        );
        await utilsService.handleValidation(
          () => cashOutRequest.validate('targetId'),
          async () => {
            cashOutRequest.targetId = await utilsService.defaultSingleAsk(
              language.getText('stablecoin.askTargetAccount'),
              currentAccount.accountId.id,
            );
          },
        );

        cashOutRequest.amount = await utilsService
          .defaultSingleAsk(language.getText('stablecoin.askBurnAmount'), '1')
          .then((val) => val.replace(',', '.'));

        await utilsService.handleValidation(
          () => cashOutRequest.validate('amount'),
          async () => {
            cashOutRequest.amount = await utilsService
              .defaultSingleAsk(
                language.getText('stablecoin.askTargetAccount'),
                '1',
              )
              .then((val) => val.replace(',', '.'));
          },
        );

        try {
          await new BurnStableCoinsService().burnStableCoin(cashOutRequest);
        } catch (error) {
          console.log(colors.red(error.message));
          await this.operationsStableCoin();
        }

        break;
      case 'Wipe':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Call to Wipe
        const account2Wipe = await utilsService.defaultSingleAsk(
          language.getText('stablecoin.askTargetAccount'),
          configAccount.accountId,
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
            this.stableCoinId,
            account2Wipe,
            amount2Wipe,
          );
        } catch (error) {
          console.log(colors.red(error.message));
          await this.operationsStableCoin();
        }

        break;
      case 'Rescue':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
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
            currentAccount,
            this.stableCoinId,
            amount2Rescue,
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
          currentAccount,
          currentAccount.accountId.id,
          this.stableCoinId,
        );

        break;
      case 'Role management':
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        await this.roleManagementFlow();
        break;
      case 'Refresh roles':
        await utilsService.cleanAndShowBanner();

        // Call to Supplier Role
        const rolesToRefresh = await new RoleStableCoinsService().getRoles(
          this.proxyContractId,
          currentAccount.accountId.id,
          new PrivateKey(
            configAccount.privateKey.key,
            configAccount.privateKey.type,
          ),
          currentAccount.accountId.id,
        );
        const externalTokensRefreshed = configAccount.externalTokens.map(
          (token) => {
            if (token.id === this.stableCoinId) {
              return {
                id: token.id,
                symbol: token.symbol,
                roles: rolesToRefresh,
              };
            }
            return token;
          },
        );
        new ManageExternalTokenService().updateAccount(externalTokensRefreshed);
        configAccount.externalTokens = externalTokensRefreshed;
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

  private async getCapabilities(
    sdk: SDK,
    currentAccount: EOAccount,
  ): Promise<Capabilities[]> {
    return await new CapabilitiesStableCoinsService().getCapabilitiesStableCoins(
      this.stableCoinId,
      sdk.getPublicKey(
        currentAccount.privateKey.key,
        currentAccount.privateKey.type,
      ),
    );
  }

  /**
   * RoleManagement Flow
   */

  private async roleManagementFlow(): Promise<void> {
    const sdk: SDK = utilsService.getSDK();
    const configAccount = utilsService.getCurrentAccount();
    const currentAccount = new EOAccount(
      configAccount.accountId,
      new PrivateKey(
        configAccount.privateKey.key,
        configAccount.privateKey.type,
      ),
    );

    const capabilitiesStableCoin = await this.getCapabilities(
      sdk,
      currentAccount,
    );
    const roleManagementOptions = language
      .getArray('wizard.roleManagementOptions')
      .filter((option) => {
        if (option == 'Edit role') {
          return capabilitiesStableCoin.some((capability) =>
            [Capabilities.CASH_IN, Capabilities.CASH_IN_HTS].includes(
              capability,
            ),
          );
        }

        return true;
      });

    const accountTarget = '0.0.0';
    switch (
      await utilsService.defaultMultipleAsk(
        language.getText('stablecoin.askEditCashInRole'),
        roleManagementOptions,
        false,
        configAccount.network,
        `${configAccount.accountId} - ${configAccount.alias}`,
        this.stableCoinWithSymbol,
      )
    ) {
      case 'Grant role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Grant role
        //Lists all roles
        const grantRoleRequest = new GrantRoleRequest({
          account: {
            accountId: currentAccount.accountId.id,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          proxyContractId: this.proxyContractId,
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(grantRoleRequest, [
          'account',
          'proxyContractId',
          'tokenId',
        ]);

        grantRoleRequest.role = await this.getRole(capabilitiesStableCoin);
        await utilsService.handleValidation(
          () => grantRoleRequest.validate('role'),
          async () => {
            grantRoleRequest.role = await this.getRole(capabilitiesStableCoin);
          },
        );

        let grantAccountTargetId = accountTarget;
        if (grantRoleRequest.role !== language.getText('wizard.goBack')) {
          grantRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => grantRoleRequest.validate('targetId'),
            async () => {
              grantAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              grantRoleRequest.targetId = grantAccountTargetId;
            },
          );

          try {
            if (
              StableCoinRole[grantRoleRequest.role] ===
              StableCoinRole.CASHIN_ROLE
            ) {
              await this.grantSupplierRole(grantRoleRequest);
            } else {
              await this.roleStableCoinService.grantRoleStableCoin(
                grantRoleRequest,
              );
            }
          } catch (error) {
            console.log(colors.red(error.message));
            await this.operationsStableCoin();
          }
        }
        break;
      case 'Revoke role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        // Revoke role
        //Lists all roles
        const revokeRoleRequest = new RevokeRoleRequest({
          account: {
            accountId: currentAccount.accountId.id,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          proxyContractId: this.proxyContractId,
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(revokeRoleRequest, [
          'account',
          'proxyContractId',
          'tokenId',
        ]);

        revokeRoleRequest.role = await this.getRole(capabilitiesStableCoin);
        await utilsService.handleValidation(
          () => revokeRoleRequest.validate('role'),
          async () => {
            revokeRoleRequest.role = await this.getRole(capabilitiesStableCoin);
          },
        );

        let revokeAccountTargetId = accountTarget;
        if (revokeRoleRequest.role !== language.getText('wizard.goBack')) {
          revokeRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => revokeRoleRequest.validate('targetId'),
            async () => {
              revokeAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              revokeRoleRequest.targetId = revokeAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.revokeRoleStableCoin(
              revokeRoleRequest,
            );
          } catch (error) {
            console.log(colors.red(error.message));
            await this.operationsStableCoin();
          }
        }
        break;
      case 'Edit role':
        await utilsService.cleanAndShowBanner();

        //Call to edit role
        const editOptions = language.getArray('roleManagement.editAction');
        switch (
          await utilsService.defaultMultipleAsk(
            language.getText('roleManagement.askRole'),
            editOptions,
            false,
            configAccount.network,
            `${currentAccount.accountId.id} - ${configAccount.alias}`,
            this.stableCoinWithSymbol,
          )
        ) {
          case editOptions[0]:
            await utilsService.cleanAndShowBanner();

            try {
              utilsService.displayCurrentUserInfo(
                configAccount,
                this.stableCoinWithSymbol,
              );

              //Increase limit
              const increaseCashInLimitRequest = new IncreaseCashInLimitRequest(
                {
                  account: {
                    accountId: currentAccount.accountId.id,
                    privateKey: {
                      key: currentAccount.privateKey.key,
                      type: currentAccount.privateKey.type,
                    },
                  },
                  proxyContractId: this.proxyContractId,
                  tokenId: this.stableCoinId,
                  targetId: '',
                  amount: '',
                },
              );

              await this.validateNotRequestedData(increaseCashInLimitRequest, [
                'account',
                'proxyContractId',
                'tokenId',
              ]);

              let increaseCashInLimitTargetId = accountTarget;
              increaseCashInLimitRequest.targetId =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('targetId'),
                async () => {
                  increaseCashInLimitTargetId =
                    await utilsService.defaultSingleAsk(
                      language.getText('stablecoin.accountTarget'),
                      accountTarget,
                    );
                  increaseCashInLimitRequest.targetId =
                    increaseCashInLimitTargetId;
                },
              );

              if (
                await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: increaseCashInLimitRequest.account,
                    targetId: increaseCashInLimitRequest.targetId,
                    proxyContractId: increaseCashInLimitRequest.proxyContractId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: increaseCashInLimitRequest.account,
                    targetId: increaseCashInLimitRequest.targetId,
                    proxyContractId: increaseCashInLimitRequest.proxyContractId,
                    supplierType: 'limited',
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let increaseAmount = '';
              increaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountIncrease'),
                  '1',
                );
              await utilsService.handleValidation(
                () => increaseCashInLimitRequest.validate('amount'),
                async () => {
                  increaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountIncrease'),
                    '1',
                  );
                  increaseCashInLimitRequest.amount = increaseAmount;
                },
              );
              //Call to SDK
              await this.roleStableCoinService.increaseLimitSupplierRoleStableCoin(
                increaseCashInLimitRequest,
              );

              await this.roleStableCoinService.getSupplierAllowance(
                new CheckCashInLimitRequest({
                  account: increaseCashInLimitRequest.account,
                  targetId: increaseCashInLimitRequest.targetId,
                  proxyContractId: increaseCashInLimitRequest.proxyContractId,
                  tokenId: increaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              await utilsService.cleanAndShowBanner();
              await utilsService.askErrorConfirmation(
                async () => await this.operationsStableCoin(),
                error,
              );
            }
            break;
          case editOptions[1]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            //Decrease limit
            const decreaseCashInLimitRequest = new DecreaseCashInLimitRequest({
              account: {
                accountId: currentAccount.accountId.id,
                privateKey: {
                  key: currentAccount.privateKey.key,
                  type: currentAccount.privateKey.type,
                },
              },
              proxyContractId: this.proxyContractId,
              tokenId: this.stableCoinId,
              targetId: '',
              amount: '',
            });

            await this.validateNotRequestedData(decreaseCashInLimitRequest, [
              'account',
              'proxyContractId',
              'tokenId',
            ]);

            let decreaseCashInLimitTargetId = accountTarget;
            decreaseCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => decreaseCashInLimitRequest.validate('targetId'),
              async () => {
                decreaseCashInLimitTargetId =
                  await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.accountTarget'),
                    accountTarget,
                  );
                decreaseCashInLimitRequest.targetId =
                  decreaseCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: decreaseCashInLimitRequest.account,
                    targetId: decreaseCashInLimitRequest.targetId,
                    proxyContractId: decreaseCashInLimitRequest.proxyContractId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              if (
                !(await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: decreaseCashInLimitRequest.account,
                    targetId: decreaseCashInLimitRequest.targetId,
                    proxyContractId: decreaseCashInLimitRequest.proxyContractId,
                    supplierType: 'limited',
                  }),
                ))
              ) {
                console.log(language.getText('cashin.notRole'));
                break;
              }

              let decreaseAmount = '';
              decreaseCashInLimitRequest.amount =
                await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.amountDecrease'),
                  '1',
                );
              await utilsService.handleValidation(
                () => decreaseCashInLimitRequest.validate('amount'),
                async () => {
                  decreaseAmount = await utilsService.defaultSingleAsk(
                    language.getText('stablecoin.amountDecrease'),
                    '1',
                  );
                  decreaseCashInLimitRequest.amount = decreaseAmount;
                },
              );

              await this.roleStableCoinService.decreaseLimitSupplierRoleStableCoin(
                decreaseCashInLimitRequest,
              );
              await this.roleStableCoinService.getSupplierAllowance(
                new CheckCashInLimitRequest({
                  account: decreaseCashInLimitRequest.account,
                  targetId: decreaseCashInLimitRequest.targetId,
                  proxyContractId: decreaseCashInLimitRequest.proxyContractId,
                  tokenId: decreaseCashInLimitRequest.tokenId,
                }),
              );
            } catch (error) {
              console.log(colors.red(error.message));
              await this.operationsStableCoin();
            }
            break;
          case editOptions[2]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const resetCashInLimitRequest = new ResetCashInLimitRequest({
              account: {
                accountId: currentAccount.accountId.id,
                privateKey: {
                  key: currentAccount.privateKey.key,
                  type: currentAccount.privateKey.type,
                },
              },
              proxyContractId: this.proxyContractId,
              tokenId: this.stableCoinId,
              targetId: '',
            });

            await this.validateNotRequestedData(resetCashInLimitRequest, [
              'account',
              'proxyContractId',
              'tokenId',
            ]);

            //Reset
            let resetCashInLimitTargetId = accountTarget;
            resetCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => resetCashInLimitRequest.validate('targetId'),
              async () => {
                resetCashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                resetCashInLimitRequest.targetId = resetCashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: resetCashInLimitRequest.account,
                    targetId: resetCashInLimitRequest.targetId,
                    proxyContractId: resetCashInLimitRequest.proxyContractId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                console.log(language.getText('cashin.unlimitedRole') + '\n');
                break;
              }

              //Call to SDK
              if (
                await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: resetCashInLimitRequest.account,
                    targetId: resetCashInLimitRequest.targetId,
                    proxyContractId: resetCashInLimitRequest.proxyContractId,
                    supplierType: 'limited',
                  }),
                )
              ) {
                await this.roleStableCoinService.resetLimitSupplierRoleStableCoin(
                  resetCashInLimitRequest,
                );
              } else {
                console.log(language.getText('cashin.notRole'));
              }
            } catch (error) {
              console.log(colors.red(error.message));
              await this.operationsStableCoin();
            }
            break;
          case editOptions[3]:
            await utilsService.cleanAndShowBanner();

            utilsService.displayCurrentUserInfo(
              configAccount,
              this.stableCoinWithSymbol,
            );

            const checkCashInLimitRequest = new CheckCashInLimitRequest({
              account: {
                accountId: currentAccount.accountId.id,
                privateKey: {
                  key: currentAccount.privateKey.key,
                  type: currentAccount.privateKey.type,
                },
              },
              proxyContractId: this.proxyContractId,
              tokenId: this.stableCoinId,
              targetId: '',
            });

            await this.validateNotRequestedData(checkCashInLimitRequest, [
              'account',
              'proxyContractId',
              'tokenId',
            ]);

            let cashInLimitTargetId = accountTarget;
            checkCashInLimitRequest.targetId =
              await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
            await utilsService.handleValidation(
              () => checkCashInLimitRequest.validate('targetId'),
              async () => {
                cashInLimitTargetId = await utilsService.defaultSingleAsk(
                  language.getText('stablecoin.accountTarget'),
                  accountTarget,
                );
                checkCashInLimitRequest.targetId = cashInLimitTargetId;
              },
            );

            try {
              if (
                await this.checkSupplierType(
                  new CheckCashInRoleRequest({
                    account: checkCashInLimitRequest.account,
                    targetId: checkCashInLimitRequest.targetId,
                    proxyContractId: checkCashInLimitRequest.proxyContractId,
                    supplierType: 'unlimited',
                  }),
                )
              ) {
                const response = language.getText(
                  'roleManagement.accountHasRoleCashInUnlimited',
                );

                console.log(
                  response.replace('${address}', accountTarget) + '\n',
                );
                break;
              }
              await this.roleStableCoinService.getSupplierAllowance(
                checkCashInLimitRequest,
              );
            } catch (error) {
              console.log(colors.red(error.message));
              await this.operationsStableCoin();
            }
            break;
          case editOptions[editOptions.length - 1]:
          default:
            await utilsService.cleanAndShowBanner();

            await this.roleManagementFlow();
        }
        break;
      case 'Has role':
        await utilsService.cleanAndShowBanner();

        utilsService.displayCurrentUserInfo(
          configAccount,
          this.stableCoinWithSymbol,
        );

        //Lists all roles
        const hasRoleRequest = new HasRoleRequest({
          account: {
            accountId: currentAccount.accountId.id,
            privateKey: {
              key: currentAccount.privateKey.key,
              type: currentAccount.privateKey.type,
            },
          },
          proxyContractId: this.proxyContractId,
          tokenId: this.stableCoinId,
          targetId: '',
          role: undefined,
        });

        await this.validateNotRequestedData(hasRoleRequest, [
          'account',
          'proxyContractId',
          'tokenId',
        ]);

        hasRoleRequest.role = await this.getRole(capabilitiesStableCoin);
        await utilsService.handleValidation(
          () => hasRoleRequest.validate('role'),
          async () => {
            hasRoleRequest.role = await this.getRole(capabilitiesStableCoin);
          },
        );

        let hasRoleAccountTargetId = accountTarget;
        if (hasRoleRequest.role !== language.getText('wizard.goBack')) {
          hasRoleRequest.targetId = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.accountTarget'),
            accountTarget,
          );
          await utilsService.handleValidation(
            () => hasRoleRequest.validate('targetId'),
            async () => {
              hasRoleAccountTargetId = await utilsService.defaultSingleAsk(
                language.getText('stablecoin.accountTarget'),
                accountTarget,
              );
              hasRoleRequest.targetId = hasRoleAccountTargetId;
            },
          );

          //Call to SDK
          try {
            await this.roleStableCoinService.hasRoleStableCoin(hasRoleRequest);
          } catch (error) {
            console.log(colors.red(error.message));
            await this.operationsStableCoin();
          }
        }
        break;
      case roleManagementOptions[roleManagementOptions.length - 1]:
      default:
        await utilsService.cleanAndShowBanner();

        await this.operationsStableCoin();
    }
    await this.roleManagementFlow();
  }

  private async validateNotRequestedData(request: any, params: string[]) {
    for (let i = 0; i < params.length; i++) {
      await utilsService.handleValidation(
        () => request.validate(params[i]),
        async () => {
          await this.operationsStableCoin();
        },
      );
    }
  }

  private filterMenuOptions(
    options: string[],
    capabilities: string[],
    roles?: string[],
  ): string[] {
    let result = [];
    let capabilitiesFilter = [];
    if (capabilities.length === 0) return options;

    capabilitiesFilter = options.filter((option) => {
      if (
        (option === 'Cash in' &&
          (capabilities.includes('Cash in') ||
            capabilities.includes('Cash in hts'))) ||
        (option === 'Burn' &&
          (capabilities.includes('Burn') ||
            capabilities.includes('Burn hts'))) ||
        (option === 'Wipe' &&
          (capabilities.includes('Wipe') ||
            capabilities.includes('Wipe hts'))) ||
        (option === 'Role management' &&
          capabilities.includes('Role management')) ||
        option === 'Refresh roles'
      ) {
        return true;
      }

      return capabilities.includes(option);
    });

    result = roles
      ? capabilitiesFilter.filter((option) => {
          if (
            (option === 'Cash in' && roles.includes('CASH IN')) ||
            (option === 'Burn' && roles.includes('BURN')) ||
            (option === 'Wipe' && roles.includes('WIPE')) ||
            (option === 'Rescue' && roles.includes('RESCUE')) ||
            option === 'Refresh roles' ||
            option === 'Details' ||
            option === 'Balance'
          ) {
            return true;
          }
          return false;
        })
      : capabilitiesFilter;

    return result.concat(language.getArray('wizard.returnOption'));
  }

  private async getRole(capabilities: Capabilities[]): Promise<any> {
    const rolesAvailability = [
      {
        role: {
          availability: capabilities.includes(Capabilities.CASH_IN),
          name: 'Cash in Role',
          value: StableCoinRole.CASHIN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Capabilities.BURN),
          name: 'Burn Role',
          value: StableCoinRole.BURN_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Capabilities.WIPE),
          name: 'Wipe Role',
          value: StableCoinRole.WIPE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Capabilities.RESCUE),
          name: 'Rescue Role',
          value: StableCoinRole.RESCUE_ROLE,
        },
      },
      {
        role: {
          availability: capabilities.includes(Capabilities.PAUSE),
          name: 'Pause Role',
          value: StableCoinRole.PAUSER_ROLE,
        },
      },
    ];
    const rolesAvailable = rolesAvailability.filter(
      ({ role }) => role.availability,
    );
    const rolesNames = rolesAvailable.map(({ role }) => role.name);

    const roleSelected = await utilsService.defaultMultipleAsk(
      language.getText('roleManagement.askRole'),
      rolesNames,
      true,
    );
    if (roleSelected !== language.getText('wizard.goBack')) {
      const roleValue = rolesAvailable.filter(
        ({ role }) => role.name == roleSelected,
      )[0].role.value;
      return roleValue;
    }
    return roleSelected;
  }

  private async grantSupplierRole(
    grantRoleRequest: GrantRoleRequest,
  ): Promise<void> {
    let limit = '';

    const supplierRoleType = language.getArray('wizard.supplierRoleType');
    grantRoleRequest.supplierType = await utilsService.defaultMultipleAsk(
      language.getText('stablecoin.askCashInRoleType'),
      supplierRoleType,
    );
    await utilsService.handleValidation(
      () => grantRoleRequest.validate('supplierType'),
      async () => {
        const supplierType = await utilsService.defaultMultipleAsk(
          language.getText('stablecoin.askCashInRoleType'),
          supplierRoleType,
        );
        grantRoleRequest.supplierType = supplierType;
      },
    );

    if (
      grantRoleRequest.supplierType ===
      supplierRoleType[supplierRoleType.length - 1]
    )
      await this.roleManagementFlow();
    if (grantRoleRequest.supplierType === supplierRoleType[0]) {
      //Give unlimited
      //Call to SDK
      if (
        await this.checkSupplierType(
          new CheckCashInRoleRequest({
            proxyContractId: grantRoleRequest.proxyContractId,
            targetId: grantRoleRequest.targetId,
            account: grantRoleRequest.account,
            supplierType: 'unlimited',
          }),
        )
      ) {
        console.log(language.getText('cashin.alreadyUnlimitedRole'));
      }

      grantRoleRequest.supplierType = 'unlimited';
      await this.roleStableCoinService.giveSupplierRoleStableCoin(
        grantRoleRequest,
      );
    }
    if (grantRoleRequest.supplierType === supplierRoleType[1]) {
      grantRoleRequest.amount = await utilsService.defaultSingleAsk(
        language.getText('stablecoin.supplierRoleLimit'),
        '1',
      );
      await utilsService.handleValidation(
        () => grantRoleRequest.validate('amount'),
        async () => {
          limit = await utilsService.defaultSingleAsk(
            language.getText('stablecoin.supplierRoleLimit'),
            '1',
          );
          grantRoleRequest.amount = limit;
        },
      );

      //Call to SDK
      if (
        await this.checkSupplierType(
          new CheckCashInRoleRequest({
            proxyContractId: grantRoleRequest.proxyContractId,
            targetId: grantRoleRequest.targetId,
            account: grantRoleRequest.account,
            supplierType: 'limited',
          }),
        )
      ) {
        console.log(language.getText('cashin.alreadyRole'));
      }

      grantRoleRequest.supplierType = 'limited';
      await this.roleStableCoinService.giveSupplierRoleStableCoin(
        grantRoleRequest,
      );
    }
  }

  private async checkSupplierType(
    req: CheckCashInRoleRequest,
  ): Promise<boolean> {
    return await this.roleStableCoinService.checkCashInRoleStableCoin(req);
  }
}
