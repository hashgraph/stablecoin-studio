export const english = {
    "general": {
        "title": "Hedera Stable Coin",
        "newLine": "\n",
        "incorrectNumber": "Incorrect number",
        "incorrectParam": "Incorrect input, retrying"
    },
    "initialConfiguration": {
        "title": "\n\n\t\tHedera Stable Coin initial configuration\n"
    },
    "configuration": {
        "askPath": "Write your config path",
        "askNetwork": "Write the network you want to use",
        "askNotDefaultNetwork": "Your option is not a default network, Do you want to create a new network? (y/n)",
        "askAccountId": "Introduce the accountId",
        "askAlias": "Introduce an alias for this account",
        "askMoreAccounts": "Do you want to introduce more accounts? (y/n)",
        "askPrivateKey": "Introduce the private key",
        "askConsensusUrl": "Introduce the url",
        "askMoreConsensusNodes": "Do you want to introduce more consensus nodes? (y/n)",
        "askMirrorNode": "Introduce the mirror url",
        "askChain": "Introduce the chain id",
        "askNode": "Introduce the node id"
    },
    "stablecoin": {
        "description": "\t\t\n\nCreating Stable Coin",
        "askName": "What is your stable coin name?",
        "askSymbol": "What is your stable coin symbol?",
        "askDecimals": "How many decimals do you want to use?",
        "askToken": "What is the id of the stable coin you want to operate with?",
        "askDoSomething": "What do you want to do?"
    },
    "commander": {
        "appDescription": "Hedera Stable Coin is a CLI for manage stable coins",
        "version": "Output the current version",
        "initDescription": "Init the application",
        "wizardDescription": "Start the wizard",
        "tokenDescription": "Token command",
        "token": {
            "createDescription": "Create a new Stable Coin and associate the new token to the admin.",
            "infoDescription": "Get the name, symbol, totalSupply, decimals and address of a Stable Coin Token.",
            "balanceDescription": "Get account balance about a Stable Coin Token.",
            "mintDescription": "Mint stable coins",
            "options": {
                "privateKey": "Private key for your account",
                "accountId": "Id of the user",
                "name": "Name of the stable coin",
                "symbol": "Symbol of the stable coin",
                "decimals": "Decimals of the stable coin",
                "address": "Address of stable coin",
                "amount": "Amount of stable coins for this action"
            }
        },
        "admin": {
            "mainDescription": "Main command for admin",
            "accountsDescription": "Get list of accounts",
            "tokensDescription": "Get list of tokens associated to an account",
            "token": {
                "description": "Subcommand token",
                "accountsDescription": "Get list of accounts associated to the token",
                "tokensDescription": "Get list of accounts associated to the token",
            }
        }
    },
    "wizard": {
        "name": "Wizard",
        "mainMenuTitle": "What do you want to do?",
        "configurationMenuTitle": "What do you want to edit?",
        "pathChanged": "\nPath changed successfully",
        "networkChanged": "\nNetwork changed successfully",
        "accountsChanged": "\nAccounts changed successfully",
        "mainOptions": [
            "Create a new Stable Coin",
            "Operate with an existing Stable Coin",
            "Configuration",
            "Exit"
        ],
        "changeOptions": [
            "Show configuration",
            "Edit config path",
            "Edit default network",
            "Edit accounts",
            "Return to main menu"
        ],
        "stableCoinOptions": [
            "Cash in",
            "Info",
            "Balance",
            "Return to main menu"
        ]
    }
}