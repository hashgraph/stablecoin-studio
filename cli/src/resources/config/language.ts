import colors from 'colors';
import * as inquirer from 'inquirer';

const separator_1 = {
  Separator_1: new inquirer.Separator(),
};

const separator_2 = {
  Separator_2: new inquirer.Separator(' '),
};

const goBack = {
  ...separator_1,
  goBack: 'Go back',
  ...separator_2,
};

const returnToMainMenu = {
  ...separator_1,
  Return: 'Return to the main menu',
  ...separator_2,
};

const basicFeatureOptions = {
  SmartContract: 'The Smart Contract',
  CurrentUser: 'Current user key',
  None: 'None',
};

export const english = {
  general: {
    title: 'Hedera Stable Coin',
    warning: '⚠️ All the transactions could incur a cost in HBar',
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
    askAccountId: 'Enter the account id',
    askNetworkAccount: 'Which network does this account belong to?',
    askPrivateKeyType: 'Which type of private key will the account use?',
    askAlias: 'Enter an alias for this account',
    aliasAlreadyInUse:
      'Alias ${alias} already in use. Please use another alias.',
    askMoreAccounts: 'Do you want to enter more accounts? (y/n)',
    askPrivateKey: 'Enter the private key',
    askPublicKey: 'Enter the public key',
    askConsensusUrl: 'Enter the url',
    askMoreConsensusNodes: 'Do you want to enter more consensus nodes? (y/n)',
    askMirrorNode: 'Enter the mirror url',
    askChain: 'Enter the chain id',
    askNode: 'Enter the node id',
    askOperateWithNewAccount:
      'Would you like to operate with the account you have just created?',
  },
  stablecoin: {
    askConfirmCreation:
      'Are you sure you want to create the stable coin with these parameters?',
    description: 'Creating Stable Coin',
    askName: 'Enter the name',
    askSymbol: 'Enter the symbol',
    askAutoRenewAccountId: 'Enter the autorenew account',
    askDecimals: 'Enter the number of decimal places a token is divisible by',
    askToken:
      'What is the token id of the stable coin you want to operate with?',
    askDoSomething: 'What do you want to do?',
    askOptionalProps:
      'Do you want to configure the initial supply, max supply or decimals?',
    askReserve: 'Do you want to link the stable coin to a Proof of Reserve?',
    askExistingReserve:
      'Do you want to link it to an already existing Proof of Reserve?',

    askReserveAddress:
      'Enter the Proof of Reserve Feed you wish to link your stable coin to',
    askReserveInitialAmount: 'Enter the Proof of Reserve Feed initial amount',
    askInitialSupply: 'Enter the initial supply',
    askSupplyType: 'Do you want the token max supply to be infinite?',
    askTotalSupply: 'Enter the max supply',
    askExpirationTime: 'Enter the token expiration time',
    askMemo: 'Enter the token memo',
    askFreezeAccount: 'Should the Hedera account be frozen for this token?',
    askFeaturesManagedBy:
      'Should the smart contract be used for all roles management?',
    features: {
      admin: 'Enter the admin key',
      supply: 'Enter the supply key',
      keyError: 'The provided key has a wrong format. Please, enter it again.',
      KYC: 'Enter the KYC key',
      freeze: 'Enter the freeze key',
      wipe: 'Enter the wipe key',
      pause: 'Enter the pause key',
      feeSchedule: 'Enter the fee schedule key',
      treasury: 'Enter the treasury account',
      key: 'Enter the key',
      publicKey: 'Enter the public key',
      keyType: 'Key type',
    },
    askTreasuryAccountAddress: 'Enter the treasury account id?',
    askOperateStableCoin:
      'Do you want to operate with the stable coin you just created?',
    created:
      'Stable Coin ${name} (${symbol}) with ${decimals} decimals has been created!',
    askCashInAmount: 'How many tokens do you want to cash in?',
    askBurnAmount: 'How many tokens do you want to burn?',
    askWipeAmount: 'How many tokens do you want to wipe?',
    askRescueAmount: 'How many tokens do you want to rescue?',
    askGrantKYCToSender: 'Do you want to grant KYC to your current account?',
    askTargetAccount: 'What is the target account?',
    askAccountToBalance:
      'Which account would you like to obtain the balance from?',
    askCashInRoleType: 'What type of permission do you want to grant?',
    askCashInRoleRevokeType: 'What type of permission do you want to revoke?',
    askEditCashInRole: 'What action do you want to perform?',
    accountTarget: 'Enter the target account id',
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
      logLevel: 'Log level to use',
      logPath: 'Directory to save the logs to',
    },
    token: {
      createDescription:
        'Create a new Stable Coin and associate the new token to the admin.',
      infoDescription:
        'Get the name, symbol, totalSupply, decimals and address of a Stable Coin Token.',
      balanceDescription: 'Get account balance for a Stable Coin Token.',
      mintDescription: 'Mint stable coins',
      options: {
        privateKey: "Account's private key",
        accountId: "User's id",
        name: "Stable coin's name",
        symbol: "Stable coin's symbol",
        autorenewAccountId:
          'Account that will pay the renew expiration time fee',
        decimals: "Stable coin's decimals",
        address: "Stable coin's address",
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
    freezeAccount: 'Which account do you want to freeze?',
    unfreezeAccount: 'Which account do you want to unfreeze?',
    grantKYCToAccount: 'Which account do you want to grant KYC to?',
    revokeKYCFromAccount: 'Which account do you want to revoke KYC from?',
    returnOption: {
      ...returnToMainMenu,
    },
    stableCoinOptions: {
      CashIn: 'Cash in',
      Details: 'Details',
      Balance: 'Balance',
      Burn: 'Burn',
      Wipe: 'Wipe',
      Rescue: 'Rescue',
      Freeze: 'Freeze an account',
      UnFreeze: 'Unfreeze an account',
      GrantKYC: 'Grant KYC to an account',
      RevokeKYC: 'Revoke KYC from an account',
      RoleMgmt: 'Role management',
      RoleRefresh: 'Refresh roles',
      DangerZone: colors.red('Danger zone'),
      ...returnToMainMenu,
    },
    mainOptions: {
      Create: 'Create a new Stable Coin',
      Manage: 'Manage imported tokens',
      Operate: 'Operate with an existing Stable Coin',
      List: 'List Stable Coins',
      Configuration: 'Configuration',
      ...separator_1,
      Exit: 'Exit',
      ...separator_2,
    },
    changeOptions: {
      Show: 'Show configuration',
      EditPath: 'Edit config path',
      EditNetwork: 'Edit default network',
      Manage: 'Manage accounts',
      ...returnToMainMenu,
    },
    manageAccountOptions: {
      Change: 'Change account',
      List: 'List accounts',
      Add: 'Add new account',
      Delete: 'Delete account',
      ...goBack,
    },
    manageImportedTokens: {
      Add: 'Add token',
      Refresh: 'Refresh token',
      Remove: 'Remove token',
      ...goBack,
    },
    roleManagementOptions: {
      Grant: 'Grant role',
      Revoke: 'Revoke role',
      Edit: 'Edit role',
      HasRole: 'Has role',
      ...goBack,
    },
    adminFeatureOptions: {
      ...basicFeatureOptions,
    },
    featureOptions: {
      ...basicFeatureOptions,
      OtherKey: 'Other public key',
    },
    supplierRoleType: {
      Unlimited: 'Unlimited',
      Limited: 'Limited',
      ...goBack,
    },
    editSupplierRoleOptions: {
      Increase: 'Increase limit',
      Decrease: 'Decrease limit',
      Reset: 'Reset limit',
      ...goBack,
    },
    backOption: {
      ...goBack,
    },
    privateKeyType: {
      ED25519: 'ED25519',
      ECDSA: 'ECDSA',
    },
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
    importedTokenAlreadyAdded: colors.red('The token is already imported.'),
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
    unpauseCompleted: 'Stable coin unpaused',
    freezeCompleted: 'Account frozen',
    unfreezeCompleted: 'Account unfrozen',
    KYCGranted: 'Account KYC granted',
    KYCRevoked: 'Account KYC revoked',
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
      'The account ${address} has the unlimited cash in role',
    accountHasRole: 'The account ${address} has the ${role} role',
    accountNotHasRole: 'The account ${address} does not have the ${role} role',
    grantRole: 'Grant ${role} role to account: ${address}',
    revokeRole: 'Revoke ${role} role to account: ${address}',
    getAmountAllowance:
      'The account ${address} has a cash in limit of ${amount}',
    editAction: {
      Increase: 'Increase cash in limit',
      Decrease: 'Decrease cash in limit',
      Reset: 'Reset cash in limit',
      Check: 'Check cash in limit',
      ...goBack,
    },
    noRoles: 'You do not have any roles.',
  },
  dangerZone: {
    confirmDelete: 'Are you sure want to delete the stable coin?',
    confirmPause: 'Are you sure you want to pause the stable coin?',
    confirmUnpause: 'Are you sure you want to unpause the stable coin?',
    options: {
      Pause: 'Pause stable coin',
      UnPause: 'Unpause stable coin',
      Delete: 'Delete stable coin',
      ...goBack,
    },
  },
};
