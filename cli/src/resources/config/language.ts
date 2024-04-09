/*
 *
 * Hedera Stablecoin CLI
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { AccountType } from '../../domain/configuration/interfaces/AccountType';
import * as inquirer from 'inquirer';
import colors from 'colors';

const separator_1 = {
  Separator_1: new inquirer.Separator(),
};

const separator_2 = {
  Separator_2: new inquirer.Separator(' '),
};

const backOption = 'Go back';

const goBack = {
  ...separator_1,
  goBack: backOption,
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
    title: 'StableCoin Studio',
    warning: '⚠️ All the transactions could incur a cost in HBar',
    newLine: '\n',
    incorrectNumber: 'Incorrect number',
    incorrectParam: 'Incorrect input, retrying',
    error:
      'An error occurred, see above for details, press any key to continue',
    continue: '↩️ Press enter to continue',
    backOption: backOption,
    previous: 'Previous',
    next: 'Next',
  },
  configuration: {
    initialTitle: '\n\n\t\tHedera Stablecoin configuration\n',
    askPath: 'Write your config path',
    askCreateConfig:
      'No configuration file found at the specified path, would you like to create one? (y/n)',
    askCreateConfigNeg:
      'You have chosen not to create the file automatically, create the configuration file and try again.',
    askNetwork: 'Select the default network',
    askNotDefaultNetwork:
      'Your option is not one of the default networks, do you want to create a new network? (y/n)',
    AccountsConfigurationMessage: 'You will now configure your accounts:',
    askAccountId: 'Enter the account id',
    askAccountPubKey: 'Enter the public key (Hexadecimal format)',
    askAccountType: `Enter the account type (${AccountType.SelfCustodial}|${AccountType.MultiSignature}|${AccountType.Fireblocks}|${AccountType.Dfns})`,
    askConfigurateFactories:
      'Do you want to config your factories? Check the documentation for more information : https://github.com/hashgraph/stablecoin-studio#deploying-the-stable-coin-factories',
    askConfigurateDefaultMirrorsAndRPCs:
      'Do you want to use default mirror node/JSON-RPC-Relay services? (y/n)',
    askConfigurateBackend: 'Do you want to configure the backend? (y/n)',
    askBackendUrl: 'Enter the backend url',
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
    askChain: 'Enter the chain id',
    askNode: 'Enter the node id',
    askOperateWithNewAccount:
      'Would you like to operate with the account you have just created?',
    askFactoryAddress: 'Enter your factory address',
    askNewFactoryAddress: 'Enter your new factory address',
    MirrorsConfigurationMessage:
      'You will now configure your mirror node services:',
    askMirrorName: 'Enter the mirror node service name',
    askMirrorNode: 'Enter the mirror url',
    askMirrorNetwork: 'Which network does the mirror service belong to?',
    askMirrorUrl: 'Which is the base URL of the service?',
    askMirrorApiKey: 'Enter the mirror node service API Key',
    askMirrorHeaderName: 'Enter the HTTP auth header name to send the API Key',
    askMirrorHasApiKey:
      'Does this service need an API Key to authenticate? (y/n)',
    askMirrorSelected: 'Do you want to use this service? (y/n)',
    askMoreMirrors: 'Do you want to enter more mirror node services? (y/n)',
    RPCsConfigurationMessage:
      'You will now configure your JSON-RPC-Relay services:',
    askRPCName: 'Enter the JSON-RPC-Relay service name',
    askRPCNetwork: 'Which network does the JSON-RPC-Relay service belong to?',
    askRPCUrl: 'Which is the base URL of the service?',
    askRPCApiKey: 'Enter the JSON-RPC-Relay service API Key',
    askRPCHeaderName: 'Enter the HTTP auth header name to send the API Key',
    askRPCHasApiKey: 'Does this service need an API Key to authenticate? (y/n)',
    askRPCSelected: 'Do you want to use this service? (y/n)',
    askMoreRPCs: 'Do you want to enter more JSON-RPC-Relay services? (y/n)',
    rpcConfigurationMessage: 'You will now configure your JSON-RPC-Relay:',
    mirrorNodeConfigurationMessage: 'You will now configure your mirror nodes:',
    askNetworkMirrorNode: 'Which network does this mirror node belong to?',
    askName: 'Enter the name',
    nameAlreadyInUse: 'Name ${name} already in use. Please use another name.',
    askBaseUrl: 'Enter the base url',
    baseUrlAlreadyInUse:
      'Base url ${baseUrl} already in use. Please use another base url.',
    askMoreMirrorNodes: 'Do you want to add another mirror node?',
    askOperateWithNewMirrorNode:
      'Would you like to operate with the mirror node you have just created?',
    askOperateWithNewRPCNode:
      'Would you like to operate with the JSON-RPC-Relay you have just created?',
    mirrorNodeDelete: 'Which mirror node would you like to delete?',
    noMoreMirrorNodes:
      'There is no mirror node in the selected network not currently being used',
    networkSelected: '\nNetwork selected: ${network}',
    mirrorNodeList: '\nMirror nodes list:',
    mirrorNodeAdded: '\nMirror nodes added:',
    mirrorNodeDeleted: '\nMirror nodes deleted successfully',
    mirrorNodeNotToChange: '\nThere is no mirror node to change',
    RPCList: '\nJSON-RPC-Relay list:',
    RPCAdded: '\nJSON-RPC-Relay added:',
    RPCDelete: 'Which JSON-RPC-Relay would you like to delete?',
    noMoreRPCs:
      'There is no JSON-RPC-Relay service in the selected network not currently being used',
    RPCDeleted: '\nJSON-RPC-Relay deleted successfully',
    askNeedApiKey: 'Do you need an API key?',
    askHeaderName: 'Enter your HTTP auth header name',
    askApiKey: 'Enter your api key',
    askSureRemove: 'Are you sure do you want to delete ${mirrorNode}?',
    selectMirrorNode: 'Select the mirror node: ',
    selectRPC: 'Select the JSON-RPC-Relay: ',
    RPCNotToChange: '\nThere is no nJSON-RPC-Relay to change',
    backendNew: 'New backend endpoint',
    backendRemoved: 'Backend endpoint removed',
    backendNotDefined: colors.red('There is no backend defined'),
    fireblocks: {
      title: 'Fireblocks account configuration',
      askApiSecretKeyPath: 'Enter your API secret key path',
      askApiKey: 'Enter you API key',
      askBaseUrl: 'Enter the Fireblocks API url',
      askAssetId: 'Enter your asset id',
      askVaultAccountId: 'Enter your vault account id',
    },
    dfns: {
      title: 'DFNS account configuration',
      askAuthorizationToken: 'Enter your authorization token',
      askCredentialId: 'Enter your credential id',
      askPrivateKeyPath: 'Enter your private key path',
      askAppOrigin: 'Enter your app origin',
      askAppId: 'Enter your app id',
      askTestUrl: 'Enter the DFNS API url',
      askWalletId: 'Enter your wallet id',
    },
  },
  stablecoin: {
    noFactories:
      "You don't have configured your factory and HederaTokenManager address. Without this configuration you cannot create an stablecoin. Check the following link for more information. https://github.com/hashgraph/stablecoin-studio/tree/main/cli#creating-a-config-file",
    askConfirmCreation:
      'Are you sure you want to create the stablecoin with these parameters?',
    description: 'Creating Stablecoin',
    askName: 'Enter the name',
    askSymbol: 'Enter the symbol',
    askAutoRenewAccountId: 'Enter the autorenew account',
    askAutoRenewPeriod: 'Enter the token autorenew period in days',
    askDecimals: 'Enter the number of decimal places a token is divisible by',
    askToken:
      'What is the token id of the stablecoin you want to operate with?',
    askDoSomething: 'What do you want to do?',
    askOptionalProps:
      'Do you want to configure the initial supply, max supply, decimals or add some metadata?',
    askReserve: 'Do you want to link the stablecoin to a Proof-of-Reserve?',
    askExistingReserve:
      'Do you want to link it to an already existing Proof-of-Reserve?',
    askReserveAddress:
      'Enter the Proof-of-Reserve Feed you wish to link your stablecoin to',
    askReserveInitialAmount: 'Enter the Proof-of-Reserve Feed initial amount',
    askProxyAdminOwner:
      'Do you want to use your current account as the proxy admin owner?',
    askProxyAdminOwnerAccount: 'Enter the proxy admin owner account',
    askInitialSupply: 'Enter the initial supply',
    askSupplyType: 'Do you want the token max supply to be infinite?',
    askTotalSupply: 'Enter the max supply',
    askMetadata: 'Enter the metadata',
    askExpirationTime: 'Enter the token expiration time in days',
    askMemo: 'Enter the token memo',
    askFreezeAccount: 'Should the Hedera account be frozen for this token?',
    askFeaturesManagedBy:
      'Should the smart contract be used for all roles management?',
    askRolesManagedBy:
      'You will be the admin for the keys that you have assigned to the Smart Contract, do you want to change the admin for one of these features?',
    askKYC: 'Do you want to enable KYC?',
    askCustomFees: 'Do you want to add custom fees?',
    askHederaTokenManagerOther: 'Other',
    askHederaTokenManagerVersion:
      'Choose the HederaTokenManager implementation you want to use',
    askHederaTokenManagerImplementation:
      'Enter the address of the HederaTokenManager implementation you want to use',
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
    initialRoles: {
      askAccount: 'Enter an account',
      burn: 'Choose the BURN admin account',
      wipe: 'Choose the WIPE admin account',
      rescue: 'Choose the RESCUE admin account',
      rescueHBAR: 'Choose the RESCUE HBAR admin account',
      pause: 'Choose the PAUSE admin account',
      freeze: 'Choose the FREEZE admin account',
      delete: 'Choose the DELETE admin account',
      kyc: 'Choose the KYC admin account',
      cashin: 'Choose the CASHIN admin account',
      options: {
        currentAccount: 'Current User Account',
        otherAccount: 'Other Account',
        noAccount: 'None',
      },
      cashinAllowance:
        "Enter the cashin allowance for the account ('0' if Unlimited)",
    },
    askTreasuryAccountAddress: 'Enter the treasury account id?',
    askOperateStableCoin:
      'Do you want to operate with the stablecoin you just created?',
    created:
      'Stablecoin ${name} (${symbol}) with ${decimals} decimals has been created!',
    askCashInAmount: 'How many tokens do you want to cash in?',
    askBurnAmount: 'How many tokens do you want to burn?',
    askWipeAmount: 'How many tokens do you want to wipe?',
    askRescueAmount: 'How many tokens do you want to rescue?',
    askRescueHBARAmount: 'How many HBAR do you want to rescue?',
    askGrantKYCToSender: 'Do you want to grant KYC to your current account?',
    askTargetAccount: 'What is the target account?',
    askAccountToBalance:
      'For which account would you like to get the balance of?',
    askCashInRoleType: 'What type of permission do you want to grant?',
    askCashInRoleRevokeType: 'What type of permission do you want to revoke?',
    askAction: 'What action do you want to perform?',
    accountTarget: 'Enter the target account id',
    sendAmount: 'Enter the amount you want to send to the account',
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
  factory: {
    askFactoryImplementation:
      'Enter the address of the factory implementation you want to use',
    askNewOwner: 'Enter the new owner account id',
    implementation: 'Current factory implementation',
    owner: 'Factory owner',
  },
  commander: {
    appDescription: 'Hedera Stablecoin is a CLI for managing stablecoins',
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
        'Create a new Stablecoin and associate the new token to the admin.',
      infoDescription:
        'Get the name, symbol, totalSupply, decimals and address of a Stablecoin Token.',
      balanceDescription: 'Get account balance for a Stablecoin Token.',
      mintDescription: 'Mint stablecoins',
      options: {
        privateKey: "Account's private key",
        accountId: "User's id",
        name: "Stablecoin's name",
        symbol: "Stablecoin's symbol",
        autorenewAccountId:
          'Account that will pay the renew expiration time fee',
        decimals: "Stablecoin's decimals",
        address: "Stablecoin's address",
        amount: 'Amount of stablecoins for this action',
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
    networkManage: 'Which network do you want to operate with?',
    accountsNotFound:
      'There is no account for the indicated parameters, here is a list of the configured accounts:',
    mirrorNodeNotRespondedAsExpected:
      'Mirror node has not responded as expected',
    accountOptions: 'Manage account menu:',
    mirrorNodeOptions: 'Manage mirror node menu:',
    rpcOptions: 'Manage JSON-RPC-Relay menu:',
    importedTokenMenu: 'Manage imported tokens:',
    accountDelete: 'Which account would you like to delete?',
    noAccountToDelete: 'You cannot delete your current account.',
    mainMenuTitle: 'What do you want to do?',
    configurationMenuTitle: 'What do you want to do?',
    pathChanged: '\nPath changed successfully',
    networkChanged: '\nNetwork changed successfully',
    networkSelected: '\nNetwork selected successfully',
    accountsChanged: '\nAccounts changed successfully',
    factoryChanged: '\nFactory changed successfully',
    factoryUpgraded: '\nFactory upgraded successfully',
    factoryOwnerChanged: '\nFactory owner changed successfully',
    freezeAccount: 'Which account do you want to freeze?',
    unfreezeAccount: 'Which account do you want to unfreeze?',
    checkAccountFrozen:
      'which account do you want to know if it is frozen for the token?',
    grantKYCToAccount: 'Which account do you want to grant KYC to?',
    revokeKYCFromAccount: 'Which account do you want to revoke KYC from?',
    checkAccountKYCGranted:
      'which account do you want to know if it has been granted the KYC for the token?',
    returnOption: {
      ...returnToMainMenu,
    },
    stableCoinOptions: {
      Send: 'Send tokens',
      CashIn: 'Cash in',
      Details: 'Details',
      Balance: 'Balance',
      Burn: 'Burn',
      Wipe: 'Wipe',
      Rescue: 'Rescue',
      RescueHBAR: 'Rescue HBAR',
      FreezeMgmt: 'Freeze Management',
      KYCMgmt: 'KYC Management',
      FeesMgmt: 'Fees management',
      RoleMgmt: 'Role management',
      Configuration: 'Configuration',
      DangerZone: colors.red('Danger zone'),
      ...returnToMainMenu,
    },
    mainOptions: {
      Create: 'Create a new Stablecoin',
      Manage: 'Manage imported tokens',
      Operate: 'Operate with an existing Stablecoin',
      List: 'List Stablecoins',
      ListPendingMultiSig: 'List pending multi-signature transactions',
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
      ManageMirrorNode: 'Manage mirror node',
      ManageRPC: 'Manage JSON-RPC-Relay',
      ManageFactory: 'Manage factory',
      ManageBackend: 'Manage backend',
      ...returnToMainMenu,
    },
    manageAccountOptions: {
      Change: 'Change account',
      List: 'List accounts',
      Add: 'Add new account',
      Delete: 'Delete account',
      ...goBack,
    },
    manageMirrorNodeOptions: {
      Change: 'Change current node',
      List: 'Display configured nodes',
      Add: 'Set up mirror node',
      Delete: 'Remove mirror node',
      ...goBack,
    },
    manageRPCOptions: {
      Change: 'Change current JSON-RPC-Relay',
      List: 'Display configured JSON-RPC-Relay',
      Add: 'Set up JSON-RPC-Relay',
      Delete: 'Remove JSON-RPC-Relay',
      ...goBack,
    },
    manageBackendTitle: 'Manage backend options',
    manageBackendOptions: {
      update: 'Update current backend endpoint',
      remove: 'Remove current backend endpoint',
    },
    manageImportedTokens: {
      Add: 'Add token',
      Refresh: 'Refresh token',
      Remove: 'Remove token',
      ...goBack,
    },
    roleManagementOptions: {
      Grant: 'Grant roles',
      Revoke: 'Revoke roles',
      Edit: 'Edit role',
      GetRole: 'Get roles',
      CheckAccountsWithRole: 'Check accounts that have a role',
      ...goBack,
    },
    CheckAccountsWithRoleOptions: {
      Admin: 'Admin',
      CashIn: 'Cash In',
      Burn: 'Burn',
      Wipe: 'Wipe',
      Rescue: 'Rescue',
      RescueHBAR: 'Rescue HBAR',
      Pause: 'Pause',
      Freeze: 'Freeze',
      Delete: 'Delete',
      KYC: 'KYC',
      ...goBack,
    },

    adminFeatureOptions: {
      ...basicFeatureOptions,
    },
    nonNoneFeatureOptions: {
      SmartContract: 'The Smart Contract',
      CurrentUser: 'Current user key',
      OtherKey: 'Other public key',
    },
    nonSmartContractAndNoneFeatureOptions: {
      CurrentUser: 'Current user key',
      OtherKey: 'Other public key',
    },
    featureOptions: {
      ...basicFeatureOptions,
      OtherKey: 'Other public key',
    },
    supplierRoleType: {
      Unlimited: 'unlimited',
      Limited: 'limited',
      ...goBack,
    },
    editSupplierRoleOptions: {
      Increase: 'Increase limit',
      Decrease: 'Decrease limit',
      Reset: 'Reset limit',
      ...goBack,
    },
    manageFactoryOptions: {
      ChangeFactory: 'Change factory',
      UpgradeFactory: 'Upgrade factory',
      ChangeOwner: 'Change owner',
      AcceptOwner: 'Accept owner',
      CancelOwner: 'Cancel owner change',
      FactoryDetails: 'Factory details',
      ...goBack,
    },
    backOption: {
      ...goBack,
    },
    privateKeyType: {
      ED25519: 'ED25519',
      ECDSA: 'ECDSA',
    },
    accountType: {
      SELF_CUSTODIAL: AccountType.SelfCustodial,
      MULTI_SIGNATURE: AccountType.MultiSignature,
      FIREBLOCKS: AccountType.Fireblocks,
      DFNS: AccountType.Dfns,
    },
    // * Multi-Signature Transactions
    multiSig: {
      listMenuTitle: 'Select a multi-signature transaction',
      txActions: {
        title: 'Multi-signature transaction actions',
        actions: {
          sign: '🖋️  Sign',
          submit: '📨 Submit',
          details: '👀 Details',
          remove: colors.red('❌ Remove'),
        },
        signingTx: '🖋️ Signing transaction...',
        signedTx: colors.green('✅ Transaction signed successfully'),
        errorSigningTx: colors.red('❌ Error signing transaction'),
        signReturn: 'Returning to multi-signature transaction list...',
        submittingTx: '📨 Submitting transaction...',
        submittedTx: colors.green('✅ Transaction submitted successfully'),
        errorSubmittingTx: colors.red('❌ Error submitting transaction'),
        submitReturn: 'Returning to multi-signature transaction list...',
        removingTx: 'Removing transaction...',
        errorRemovingTx: colors.red('❌ Error removing transaction'),
        removedTx: colors.green('✅ Transaction removed successfully \n'),
        removeReturn: 'Returning to multi-signature transaction list...',
        detailsContinue:
          'Press return to go back to the multi-signature transaction actions...',
      },
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
    rescueHBARCompleted: 'HBAR Rescue completed',
    wipeCompleted: 'Wipe completed',
    detailsCompleted: 'Details loaded',
    proxyConfigCompleted: 'Proxy config loaded',
    factoryProxyConfigCompleted: 'Factory proxy config loaded',
    balanceCompleted: 'Balance loaded',
    associateCompleted: 'Stablecoin associated',
    deleteCompleted: 'Stablecoin deleted',
    pauseCompleted: 'Stablecoin paused',
    unpauseCompleted: 'Stablecoin unpaused',
    freezeCompleted: 'Account frozen',
    unfreezeCompleted: 'Account unfrozen',
    accountNotFrozen:
      'The account ${address} is unfrozen for the ${token} token',
    accountFrozen: 'The account ${address} is frozen for the ${token} token',
    KYCGranted: 'Account KYC granted',
    KYCRevoked: 'Account KYC revoked',
    accountKYCGranted:
      'The account ${address} has KYC granted for the ${token} token',
    accountKYCNotGranted:
      'The account ${address} has not KYC granted for the ${token} token',
    customFeeCreated: 'Custom fee created',
    customFeesRemoved: 'Custom fees removed',
    transferCompleted: 'Transfer completed',
    updateCompleted: 'Update completed',
    changeOwnerCompleted: 'Owner change requested',
    acceptOwnerCompleted: 'Owner change accepted',
    upgradeImplementationCompleted: 'Implementation upgrade completed',
  },
  operation: {
    success: colors.green('Operation has been completed successfully.'),
    reject: colors.red('Operation has not been completed. Please, try again.'),
  },
  send: {
    noTokens: 'You have no tokens',
    anotherAccount: 'Do you want to send more tokens?',
    confirmation: 'Do you want to proceed sending these amounts?',
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
  rescueHBAR: {
    success: 'You have rescued ${hbars} HBARs',
  },
  account: {
    wrong: colors.red('Incorrect account format. Please try again.'),
  },
  validations: {
    wrongFormatAddress:
      'The address format is not correct. Please check the format and try again.',
    duplicatedMirrorName:
      'The mirror node service name already exists for the selected network.',
    duplicatedMirrorUrl:
      'The mirror node service url already exists for the selected network.',
    duplicatedRPCName:
      'The JSON-RPC-Relay service name already exists for the selected network.',
    duplicatedRPCUrl:
      'The JSON-RPC-Relay service url already exists for the selected network.',
    wrongFormatUrl:
      'The url format is not correct. Please check the format and try again.',
    lessZero: 'The number is 0 or less. Please use a number greater than 0.',
    wrongFactoryAddress:
      'The address does not correspond to a valid factory contract.',
  },
  roleManagement: {
    askRoles: 'Choose the roles',
    askAccount: 'Enter an account',
    askMoreAccounts: 'Do you want to add another account?',
    askUnlimited:
      'Do you want the account to have an unlimited cashin allowance?',
    askAllowance: 'Enter the cashin allowance for the account ',
    askConfirmation: 'Do you want to proceed?',
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
    askRolesForAccount: 'Choose a role to obtain the associated accounts ',
  },
  feeManagement: {
    askFeeType: 'What kind of fee do you want to add?',
    chooseFeeType: {
      FixedFee: 'Fixed Fee',
      FractionalFee: 'Fractional Fee',
    },
    askFractionType: 'How would you like to specify your Fractional Fee?',
    chooseFractionalType: {
      Percentage: 'Percentage',
      Fraction: 'Fraction (Numerator and Denominator)',
    },
    askPercentageFee: 'Enter the percentage fee',
    askCollectorsExempt:
      'Do you want collectors to be exempt from paying this fee?',
    askAmount: 'Enter the fixed fee amount',
    askHBAR: 'Do you want the fees to be paid in HBARs?',
    askTokenId: 'Enter the token Id',
    askCollectorId: 'Enter the collector Id',
    askNumerator: "Enter the fraction's numerator",
    askDenominator: "Enter the fraction's denominator",
    askMin: 'Enter the minimum fee',
    askMax: 'Enter the maximum fee',
    askRemoveFee: 'Do you want to remove this fee?',
    listOfFeesToRemove: 'These are the fees you selected to be removed',
    askAssesmentMethod:
      'Do you want the fees to be deducted from the transfered amount?',
    confirmCreate:
      'Are you sure want to add this custom fee to the stablecoin?',
    confirmRemove:
      'Are you sure you want to remove these custom fees from the stablecoin?',
    options: {
      Create: 'Create fee',
      Remove: 'Remove fee',
      List: 'Fees list',
      ...goBack,
    },
  },
  stableCoinConfiguration: {
    options: {
      proxyConfiguration: 'Stablecoin Configuration',
      tokenConfiguration: 'Token Configuration',
      ...goBack,
    },
    askConfiguration: 'What do you want to configure?',
  },
  proxyConfiguration: {
    options: {
      implementation: 'Upgrade stablecoin implementation',
      owner: 'Change stablecoin owner',
      accept: 'Accept stablecoin owner',
      cancel: 'Cancel stablecoin owner change',
      ...goBack,
    },
    askNewImplementation:
      'Choose the HederaTokenManager implementation you want to use',
    askNewOwner: 'Enter the new owner account id',
    askProxyConfiguration: 'What do you want to do',
    currentImplementation: 'Your current implementation is : ',
    pendingOwner: 'pending owner : ',
    askAcceptOwner: 'Are you sure you want to accept the ownership?',
    askCancelOwner: 'Are you sure you want to cancel the ownership transfer?',
  },
  tokenConfiguration: {
    askAction: 'What token property do you want to update?',
    askKeysAction: 'What token key do you want to update?',
    confirm: 'Are you sure you want to apply these changes?',
    goBack: 'If you continue, you will lose your changes',
    options: {
      name: 'Name',
      symbol: 'Symbol',
      expirationTime: 'Expiration time',
      autoRenewPeriod: 'Autorenew period',
      keys: 'Keys',
      metadata: 'Metadata',
      save: 'Save',
      ...goBack,
    },
  },
  kycManagement: {
    options: {
      GrantKYC: 'Grant KYC to an account',
      RevokeKYC: 'Revoke KYC from an account',
      AccountKYCGranted: 'Check KYC status from an account',
    },
  },
  freezeManagement: {
    options: {
      Freeze: 'Freeze an account',
      UnFreeze: 'Unfreeze an account',
      AccountFrozen: 'Check if account is frozen',
    },
  },
  keysManagement: {
    askKeys: 'Choose the keys',
    // confirm: 'Are you sure you want to apply these changes?',
    options: {
      updateKeys: 'Update keys',
      // confirmChanges: 'Confirm changes',
      ...goBack,
    },
  },
  dangerZone: {
    confirmDelete: 'Are you sure want to delete the stablecoin?',
    confirmPause: 'Are you sure you want to pause the stablecoin?',
    confirmUnpause: 'Are you sure you want to unpause the stablecoin?',
    options: {
      Pause: 'Pause stablecoin',
      UnPause: 'Unpause stablecoin',
      Delete: 'Delete stablecoin',
      ...goBack,
    },
  },
};
