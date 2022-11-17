import colors from 'colors';
import * as inquirer from 'inquirer';

export const english = {
  general: {
    title: 'Hedera Stable Coin',
    newLine: '\n',
    incorrectNumber: 'Incorrect number',
    incorrectParam: 'Incorrect input, retrying',
    error:
      'An error occurred, see above for details, press any key to continue',
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
    askNetwork: 'Select the default network',
    askNotDefaultNetwork:
      'Your option is not one of the default networks, do you want to create a new network? (y/n)',
    askAccountId: 'Introduce the account id',
    askNetworkAccount: 'Which network does this account belong to?',
    askPrivateKeyType: 'Which type of private key will the account use?',
    askAlias: 'Introduce an alias for this account',
    aliasAlreadyInUse:
      'Alias ${alias} already in use. Please use another alias.',
    askMoreAccounts: 'Do you want to introduce more accounts? (y/n)',
    askPrivateKey: 'Introduce the private key',
    askPublicKey: 'Introduce the public key',
    askConsensusUrl: 'Introduce the url',
    askMoreConsensusNodes:
      'Do you want to introduce more consensus nodes? (y/n)',
    askMirrorNode: 'Introduce the mirror url',
    askChain: 'Introduce the chain id',
    askNode: 'Introduce the node id',
    askOperateWithNewAccount:
      'Would you like to operate with the account you have just created?',
  },
  stablecoin: {
    askConfirmCreation:
      'Are you sure you want to create the stable coin with these parameters?',
    description: 'Creating Stable Coin',
    askName: 'Introduce name',
    askSymbol: 'Introduce symbol?',
    askAutoRenewAccountId: 'Introduce autorenew account',
    askDecimals:
      'Introduce the number of decimal places a token is divisible by',
    askToken:
      'What is the token id of the stable coin you want to operate with?',
    askDoSomething: 'What do you want to do?',
    askOptionalProps:
      'Do you want to configure the initial supply, max supply or decimals?',
    askInitialSupply: 'Introduce initial supply',
    askSupplyType: 'Do you want that the token supply will be infinite?',
    askTotalSupply: 'Introduce max supply',
    askExpirationTime: 'Introduce token expiration time',
    askMemo: 'Introduce token memo',
    askFreezeAccount:
      'Should the Hedera account relative to this token will be frozen by default?',
    askFeaturesManagedBy:
      'Should the smart contracts be used for all role management?',
    features: {
      admin: 'Introduce the admin key',
      supply: 'Introduce the supply key',
      keyError:
        'The introduced key has the wrong format. Please, introduce it again.',
      KYC: 'Introduce the KYC key',
      freeze: 'Introduce the freeze key',
      wipe: 'Introduce the wipe key',
      pause: 'Introduce the pause key',
      feeSchedule: 'Introduce the fee schedule key',
      treasury: 'Introduce the treasury account',
      key: 'Introduce the key',
      publicKey: 'Introduce the public key',
    },
    askTreasuryAccountAddress: 'What will be the treasury account id?',
    askOperateStableCoin:
      'Do you want to operate with the stable coin you just created?',
    created:
      'Stable Coin ${name} (${symbol}) with ${decimals} decimals have been created!',
    askCashInAmount: 'How many tokens do you want to cash in?',
    askBurnAmount: 'How many tokens do you want to burn?',
    askWipeAmount: 'How many tokens do you want to wipe?',
    askRescueAmount: 'How many tokens do you want to rescue?',
    askTargetAccount: 'What is the target account?',
    askAccountToBalance:
      'Which account would you like to obtain the balance from?',
    askCashInRoleType: 'What type of permission do you want to give?',
    askCashInRoleRevokeType: 'What type of permission do you want to revoke?',
    askEditCashInRole: 'What action do you want to perform?',
    accountTarget: 'Introduce the target account id',
    supplierRoleLimit: 'What will the limit be?',
    amountIncrease: 'Amount to increase',
    amountDecrease: 'Amount to decrease',
    initialSupplyError: colors.red(
      'Initial supply cannot be more than the max supply.',
    ),
    autoRenewAccountError: colors.red(
      'The autorenew account must be your current account.',
    ),
  },
  commander: {
    appDescription: 'Hedera Stable Coin is a CLI for managing stable coins',
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
    importedTokenMenu: 'Manage imported tokens:',
    accountDelete: 'Which account would you like to delete?',
    noAccountToDelete: 'You cannot delete your current account.',
    mainMenuTitle: 'What do you want to do?',
    configurationMenuTitle: 'What do you want to do?',
    pathChanged: '\nPath changed successfully',
    networkChanged: '\nNetwork changed successfully',
    accountsChanged: '\nAccounts changed successfully',
    mainOptions: [
      'Create a new Stable Coin',
      'Manage imported tokens',
      'Operate with an existing Stable Coin',
      'List Stable Coins',
      'Configuration',
      new inquirer.Separator(),
      'Exit',
      new inquirer.Separator(' '),
    ],
    changeOptions: [
      'Show configuration',
      'Edit config path',
      'Edit default network',
      'Manage accounts',
      new inquirer.Separator(),
      'Return to main menu',
      new inquirer.Separator(' '),
    ],
    manageAccountOptions: [
      'Change account',
      'List accounts',
      'Add new account',
      'Delete account',
      new inquirer.Separator(),
      'Go back',
      new inquirer.Separator(' '),
    ],
    manageImportedTokens: [
      'Add token',
      'Refresh token',
      'Remove token',
      new inquirer.Separator(),
      'Go back',
      new inquirer.Separator(' '),
    ],
    stableCoinOptions: [
      'Cash in',
      'Details',
      'Balance',
      'Burn',
      'Wipe',
      'Rescue',
      'Role management',
      'Refresh roles',
      new inquirer.Separator(),
      'Return to main menu',
      new inquirer.Separator(' '),
    ],
    roleManagementOptions: [
      'Grant role',
      'Revoke role',
      'Edit role',
      'Has role',
      new inquirer.Separator(),
      'Go back',
      new inquirer.Separator(' '),
    ],
    adminFeatureOptions: ['Current user key', 'None'],
    featureOptions: [
      'The smart contract',
      'Current user key',
      'Other key',
      'None',
    ],
    supplierRoleType: [
      'Unlimited',
      'Limited',
      new inquirer.Separator(),
      'Back',
      new inquirer.Separator(' '),
    ],
    editSupplierRoleOptions: [
      'Increase limit',
      'Decrease limit',
      'Reset limit',
      new inquirer.Separator(),
      'Back',
      new inquirer.Separator(' '),
    ],
    backOption: [
      new inquirer.Separator(),
      'Go back',
      new inquirer.Separator(' '),
    ],
    returnOption: [
      new inquirer.Separator(),
      'Return to main menu',
      new inquirer.Separator(' '),
    ],
    goBack: 'Go back',
    privateKeyType: ['ED25519', 'ECDSA'],
  },
  manageImportedToken: {
    tokenId: 'What is the token id?',
    tokenIdError: colors.red('Wrong id format. Please try again'),
    tokenToDelete: 'Which token do you want to delete?',
    tokenToRefresh: 'Which token do you want to refresh?',
    separator: new inquirer.Separator(
      colors.yellow('------ Imported Tokens ------'),
    ),
    noImportedTokensRefresh: colors.red(
      "You don't have any imported token to refresh. Please add one first",
    ),
    noImportedTokensDelete: colors.red(
      "You don't have any imported token to delete. Please add one first",
    ),
  },
  state: {
    searching: 'Searching...',
    loading: 'Loading...',
    loadCompleted: 'Load completed',
    searchingSuccess: 'The search has been completed successfully',
    cashInCompleted: 'Cash in completed',
    burnCompleted: 'Burn completed',
    rescueCompleted: 'Rescue completed',
    wipeCompleted: 'Wipe completed',
    detailsCompleted: 'Details loaded',
    balanceCompleted: 'Balance loaded',
    associateCompleted: 'Stable coin associated',
    deleteCompleted: 'Stable coin deleted',
    pauseCompleted: 'Stable coin paused',
  },
  operation: {
    success: colors.green('Operation has been completed successfully.'),
    reject: colors.red('Operation has not been completed. Please, try again.'),
  },
  cashin: {
    unlimitedRole: 'This account has unlimited cash in role',
    alreadyUnlimitedRole: 'This account already has unlimited cash in role.',
    alreadyRole: 'This account already has cash in role.',
    notUnlimitedRole: 'This account does not have unlimited cash in role.',
    notRole: 'This account does not have cash in role.',
  },
  rescue: {
    success: 'You have rescued ${tokens} tokens',
  },
  account: {
    wrong: colors.red('Incorrect account format. Please try again.'),
  },
  validations: {
    wrongFormatAddress:
      'The address format is not correct. Please check the format and try again.',
    lessZero: 'The number is 0 or less. Please use a number greater than 0.',
  },
  roleManagement: {
    askRole: 'Select a role',
    accountHasRoleCashInUnlimited:
      'The account ${address} has the cash in role of type unlimited',
    accountHasRole: 'The account ${address} has the ${role} role',
    accountNotHasRole: 'The account ${address} does not have the ${role} role',
    grantRole: 'Grant ${role} role to account: ${address}',
    revokeRole: 'Revoke ${role} role to account: ${address}',
    getAmountAllowance:
      'The account ${address} has a cash in limit of ${amount}',
    editAction: [
      'Increase cash in limit',
      'Decrease cash in limit',
      'Reset cash in limit',
      'Check cash in limit',
      new inquirer.Separator(),
      'Go back',
      new inquirer.Separator(' '),
    ],
    noRoles: 'You do not have any roles.',
  },
};
