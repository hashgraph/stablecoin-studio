export const english = {
  general: {
    title: 'Hedera Stable Coin',
    newLine: '\n',
    incorrectNumber: 'Incorrect number',
    incorrectParam: 'Incorrect input, retrying',
  },
  initialConfiguration: {
    title: '\n\n\t\tHedera Stable Coin initial configuration\n',
  },
  configuration: {
    askPath: 'Write your config path',
    askCreateConfig:
      'No configuration file found at the specified path, would you like to create one? (y/n)',
    askCreateConfigNeg:
      'You have chosen not to create the file automatically, create the configuration file and try again.',
    askNetwork: 'Write the network you want to use',
    askNotDefaultNetwork:
      'Your option is not a default network, Do you want to create a new network? (y/n)',
    askAccountId: 'Introduce the accountId',
    askNetworkAccount: 'Which network does this account belong to?',
    askAlias: 'Introduce an alias for this account',
    aliasAlreadyInUse:
      'Alias ${alias} already in use. Please use another alias.',
    askMoreAccounts: 'Do you want to introduce more accounts? (y/n)',
    askPrivateKey: 'Introduce the private key',
    askConsensusUrl: 'Introduce the url',
    askMoreConsensusNodes:
      'Do you want to introduce more consensus nodes? (y/n)',
    askMirrorNode: 'Introduce the mirror url',
    askChain: 'Introduce the chain id',
    askNode: 'Introduce the node id',
    askOperateWithNewAccount:
      'Would you like to operate with the last account you have created?',
  },
  stablecoin: {
    askConfirmCreation:
      'Are you sure to create the stable coin with these parameters?',
    description: 'Creating Stable Coin',
    askName: 'What is your stable coin name?',
    askSymbol: 'What is your stable coin symbol?',
    askAutoRenewAccountId: 'What will be the autorenew account?',
    askDecimals: 'How many decimals do you want to use?',
    askToken: 'What is the id of the stable coin you want to operate with?',
    askDoSomething: 'What do you want to do?',
    askOptionalProps:
      'Do you want to configure the initial supply, total supply, decimals, expiration time, admins keys or token memo?',
    askInitialSupply: 'What will be the initial supply?',
    askSupplyType: 'Do you want that the token supply will be infinite?',
    askTotalSupply: 'What will be the total supply?',
    askExpirationTime: 'What will be the token expiration time?',
    askMemo: 'What will be the token Memo?',
    askFreezeAccount:
      'Do you want that the Hedera account relative to this token will be freeze by default?',
    askFeaturesManagedBy:
      'Do you want that the following features will be managed trough the SmartContract: Admin, Supply, Freeze, KYC, Wipe, FeeSchedule?',
    askConfigureFeatures:
      'Do you want to configure some the previuous features? The not configured features will not be availables to edit in the future.',
    features: {
      admin: 'What will be the Admin key?',
      supply: 'What will be the Supply key?',
      KYC: 'What will be the KYC key?',
      freeze: 'What will be the Freeze key?',
      wipe: 'What will be the Wipe key?',
      pause: 'What will be the Pause key?',
      feeSchedule: 'What will be the Fee Schedule key?',
      key: 'Enter the key',
    },
    askTreasuryAccountAddress: 'What will be the Treasury account id?',
    askOperateStableCoin: 'Do you want to operate with stable coin created?',
    created:
      'Stable Coin ${name} (${symbol}) with ${decimals} decimals have been created!',
    askCashInAmount: 'How many tokens do you want to cash in?',
    askWipeAmount: 'How many tokens do you want to wipe?',
    askRescueAmount: 'How many tokens do you want to rescue?',
    askTargetAccount: 'What is the target account?',
    askAccountToBalance:
      'Which account would you like to obtain the balance from?',
    askSupplierRoleType: 'What kind of permission do you want to give?',
    askSupplierRoleRevokeType: 'What type of permit do you want to revoke?',
    askEditSupplierRole: 'What action do you want to perform?',
    accountTarget: 'Enter the id of the target account',
    supplierRoleLimit: 'What will be the limit?',
    amountIncrease: 'Amount to increase',
    amountDecrease: 'Amount to decrease',
  },
  commander: {
    appDescription: 'Hedera Stable Coin is a CLI for manage stable coins',
    version: 'Output the current version',
    initDescription: 'Init the application',
    wizardDescription: 'Start the wizard',
    tokenDescription: 'Token command',
    options: {
      config: 'Path to the configuration file',
      network: 'Network to use',
    },
    token: {
      createDescription:
        'Create a new Stable Coin and associate the new token to the admin.',
      infoDescription:
        'Get the name, symbol, totalSupply, decimals and address of a Stable Coin Token.',
      balanceDescription: 'Get account balance about a Stable Coin Token.',
      mintDescription: 'Mint stable coins',
      options: {
        privateKey: 'Private key for your account',
        accountId: 'Id of the user',
        name: 'Name of the stable coin',
        symbol: 'Symbol of the stable coin',
        autorenewAccountId:
          'Account that will paid the fee in case of renew expiration time',
        decimals: 'Decimals of the stable coin',
        address: 'Address of stable coin',
        amount: 'Amount of stable coins for this action',
      },
    },
    admin: {
      mainDescription: 'Main command for admin',
      accountsDescription: 'Get list of accounts',
      tokensDescription: 'Get list of tokens associated to an account',
      token: {
        description: 'Subcommand token',
        accountsDescription: 'Get list of accounts associated to the token',
        tokensDescription: 'Get list of accounts associated to the token',
      },
    },
  },
  wizard: {
    name: 'Wizard',
    accountLogin: 'Which account do you want to operate with?',
    accountsNotFound:
      'There is no account for the indicated parameters, here is a list of the configured accounts:',
    accountOptions: 'Manage account menu:',
    accountDelete: 'Which account would you like to delete?',
    noAccountToDelete: 'You cannot delete your current account.',
    mainMenuTitle: 'What do you want to do?',
    configurationMenuTitle: 'What do you want to do?',
    pathChanged: '\nPath changed successfully',
    networkChanged: '\nNetwork changed successfully',
    accountsChanged: '\nAccounts changed successfully',
    mainOptions: [
      'Create a new Stable Coin',
      'Operate with an existing Stable Coin',
      'List Stable Coins',
      'Configuration',
      'Exit',
    ],
    changeOptions: [
      'Show configuration',
      'Edit config path',
      'Edit default network',
      'Manage accounts',
      'Return to main menu',
    ],
    manageAccountOptions: [
      'Change account',
      'List accounts',
      'Add new account',
      'Delete account',
      'Go back',
    ],
    stableCoinOptions: [
      'Cash in',
      'Details',
      'Balance',
      'Cash out',
      'Wipe',
      'Rescue',
      'Role management',
      'Return to main menu',
    ],
    supplierOptions: [
      'Give supplier role',
      'Revoke supplier role',
      'Edit supplier role',
      'Back',
    ],
    featureOptions: ['The Smart Contract', 'Admin Key', 'Other key', 'None'],
    supplierRoleType: ['Unlimited', 'Limited', 'Back'],
    editSupplierRoleOptions: [
      'Increase limit',
      'Decrease limit',
      'Reset limit',
      'Back',
    ],
  },
  state: {
    searching: 'Searching...',
    loading: 'Loading...',
    loadCompleted: 'Load completed',
    searchingSuccess: 'The search has been completed successfully',
  },
  operation: {
    success: 'Operation has been completed successfully.',
    reject: 'Operation has not been completed. Please, try again.',
  },
  supplier: {
    alreadyUnlimitedRole: 'This account already have unlimited supplier role.',
    alreadyRole: 'This account already have supplier role.',
    notUnlimitedRole: 'This account does not have unlimited supplier role.',
    notRole: 'This account does not have supplier role.',
  },
  rescue: {
    success: 'You have rescued ${tokens} tokens',
  },
  account: {
    wrong: 'Incorrect account format. Please try again.',
  },
  validations: {
    wrongFormatAddress:
      'The format of the address is not correct. Please check the format and try again.',
    lessZero: 'The number is 0 or less. Please use a number greater than 0.',
  },
};
