<div align="center">

# Stablecoin Studio - Backend

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

### Table of Contents

- **[Context](#context)**
- **[Architecture](#architecture)**
- **[Overview](#overview)**
  - [Add a transaction](#add-a-transaction)
  - [Sign a transaction](#sign-a-transaction)
  - [Update a transaction](#update-a-transaction)
  - [Delete a transaction](#delete-a-transaction)
  - [Retrieve all transactions](#retrieve-all-transactions)
  - [Retrieve transactions for public key](#retrieve-transactions-for-public-key)
- **[Technologies](#technologies)**
- **[Installation](#installation)**
- **[Build](#build)**
- **[Run](#run)**
- **[Configuration](#configuration)**
- **[Testing](#testing)**
- **[Contributing](#contributing)**
- **[Code of conduct](#code-of-conduct)**
- **[License](#license)**

# Context

The backend module is meant to be used in combination with the __Hedera StableCoin Studio__.

Its purpose is to enable multisignatures for stable coins management operations.

> Only _single level_ multikeys are supported for now. Keys lists/Threshold keys associated to accounts cannot contain key lists/threshold keys themselves as keys.

Whenever users need to submit to the DLT network a transaction (Cash In, Freeze, ...) associated to an account that has multiple keys (key list or threshold keys) they will have the possibility to interact with the backend in the following way:

- They will first add the "raw transaction" (unsigned string of bytes) to the backend's database using the backend's api.
- After the transaction is created, key owners will have the possibility to asyncronously sign the transaction.
- Once all the required keys have signed the transaction, anyone can retrieve the transaction and its signatures, concatenate them and submit it to the Hedera network. (*)

> (*) If the transaction is not submited by anyone yet it has been properly signed, the __scheduled job__ will pick it up and submit it automatically.

# Architecture

The backend is made of two components:
- **API**: the api interacts with the underlying database and exposes 4 functionalities
  - _Add a transaction_: allows for a new, unsigned transaction to be added to the database.
  - _Sign a transaction_: allows for a transaction to be signed by one of the keys associated to the account the transaction belongs to.
  - _Update a transaction_: allows for a transaction fields to be updated (status).
  - _Remove a transaction_: allows for a transaction to be removed from the database.
  - _Retrieve transactions_: allows for transactions to be retrieved, either all of them or those that are associated to a given public key.
- **Database**: the db where transactions are stored waiting to be signed by all account's keys before submitting them to the Hedera DLT. It has one table with the following columns.
  - _id_: Every transaction has UUID that uniquely identifies it within the database.
  - _transactionMessage_: The content of the unsigned raw transaction submitted when creating a new transaction.
  - _description_: Description of what the _transactionMessage_ does. This is useful so that users know what the transaction is supposed to do before signing it.
  - _hederaAccountId_: The hedera account the transaction belongs to.
  - _signatures_: List of signatures already added to the transaction.
  - _keyList_: List of public keys associated to the account the transaction belongs to. These are the keys that have the right to sign the transaction.
  - _signedKeys_: List of public keys that have already signed the transaction (their signatures have been added to _signatures_).
  - _startDate_: The date and time at which the transaction can eb submitted to the DLT.
  - _status_: Current status of the transaction. There are two options:
    - PENDING: transaction signature is still in progress.
    - SIGNED: all required keys have already signed the transaction, we can submit it to the Hedera DLT.
    - EXPIRED : all transactions that cannot be submitted to the DLT anymore. Transactions can be submitted within a 3-minute window from their startDate. After that, the transaction is considered "expired" and can no longer be submitted (it must be recreated).
    - ERROR : a transaction that is no longer valid. Some transactions are valid when created but become invalid due to subsequent transactions submitted immediately after their creation. In such cases, the transaction status is set to "error" by the "scheduled job" when trying to submit it.
    - EXECUTED : a transaction that has been properly submitted to the DLT.
  - _threshold_: minimum number of keys that must sign the transaction before we can submit to the network (update its status to _SIGNED_).
- **Scheduled Job**: the scheduled job is a job that runs every 30 seconds (by default but it can be configured in the .env file) and scans the DB looking for two types of transactions.
  - Transactions ready to submit : transactions that have been signed by all the necessary keys and we are currently within its 3-minute validity time windows (3 minutes from its start date). The scheduled job will pick these transactions and submit them to the DLT.
    - If the transaction succeeds, its status is set to "EXECUTED".
    - If the transaction fails, its status is set to "ERROR".
  - Expired Transactions : These are "pending" or "signed" transactions whose start date is more than 3 minutes ago. The scheduled job will change the status of these transactions to "EXPIRED".

# Overview

## Add a transaction

 - __Path__ : /v1/transactions
 - __HTTP Method__ : POST
 - __Body__ : 
 ```
{
  "payload": "transaction_raw_message",
  "description": "transaction_short_description",
  "accountId": "your_account_id",
  "keyList": ["PK1", "PK2", ...],
  "threshold": "number"
}
 ```
 - __Logic__ : 
    - Action : transaction is added to the DB.
 - __Status code__ :
    - 201 Created: Transaction added successfully.
    - 400 Bad Request: Invalid request payload.
    - 500 Internal Server Error: An error occurred during the process.

 - __Response__ : 
```
{
  "transactionId": "generated_transaction_ID"
}
```

## Sign a transaction

 - __Path__ : `/v1/transactions/{transactionId}/signature`
 - __HTTP Method__ : PUT
 - __Body__ : 
 ```
{
  "signedTransactionMessage": "transaction_signed_message",
  "publicKey": "public_key_used_for_signing"
}
 ```
 - __Logic__ : 
    - Success : 
      - transaction id exists
      - public key is part of the remaining key list (has the right to sign)
      - body’s signatures matches the provided public key
      - the signature added to the body is indeed associated to the provided public key (compare with the current transaction body)
    - Action : 
      - updates the Body of the transaction in the DB
      - removes the public key from the list of “Remaining keys”
      - Updates the threshold
 - __Status code__ :
    - 204 No content: Transaction updated successfully.
    - 400 Bad Request: Invalid _transactionId_ format.
    - 401 Unauthorized: Unauthorized key.
    - 404 Not Found: _transactionId_ could not be found.
    - 409 Conflict: _transactionId_ already signed by the provided key.
    - 500 Internal Server Error: An error occurred during the process.

## Update a transaction

 - __Path__ : `/v1/transactions/{transactionId}/update`
 - __HTTP Method__ : PUT
 - __Body__ : 
 ```
{
  "status": "new_status",
}
 ```
 - __Logic__ : 
    - Success : 
      - transaction id exists
      - status is a valid status
    - Action : 
      - updates the Transaction status
 - __Status code__ :
    - 204 No content: Transaction updated successfully.
    - 400 Bad Request: Invalid _transactionId_ format or _status_ value.
    - 401 Unauthorized: Unauthorized key.
    - 404 Not Found: _transactionId_ could not be found.
    - 409 Conflict: _transactionId_ already signed by the provided key.
    - 500 Internal Server Error: An error occurred during the process.

## Delete a transaction

 - __Path__ : `/v1/transactions/{transactionId}`
 - __HTTP Method__ : DELETE
  __Logic__ : 
    - Success : 
      - transaction id exists
    - Action : removes transaction from the DB.
 - __Status code__ :
    - 204 No content: Transaction removed successfully.
    - 400 Bad Request: Invalid _transactionId_ format.
    - 404 Not Found: _transactionId_ could not be found.
    - 500 Internal Server Error: An error occurred during the process.

## Retrieve All transactions

 - __Path__ : /v1/transactions
 - __HTTP Method__ : GET
 - __Query Params__ : 
    - _network_: network name (optional)
    - _publicKey_: public key (optional)
    - _status_: transaction status (optional)
    - _page_: page number (optional)
    - _limit_: number of transactions per page (optional)
    - _hederaAccountId_: account id (optional)
  - __Logic__ : 
    - Action: Returns all the transactions from the DB (paginated response), optionally filtered by network, publicKey, account id and status.
 - __Status code__ :
    - 200 OK.
    - 500 Internal Server Error: An error occurred during the process.
 - __Response__ : 
```
[
  {
    "id" :"transaction_id",
    "transaction_message": "hexadecimal_array_of_bytes",
    "description": "transaction_short_description",
    "hedera_account_id": "your_account_id",
    "signatures": ["signature_1", "signature_2", ...],
    "key_list": ["PK1", "PK2", ...],
    "signed_keys": ["PK1", "PK2", ...],
    "status": "transaction_status",
    "threshold":"number",
    "signatures": ["signature_1", "signature_2", ...]
  },
  {...}
]
```

## Retrieve transactions by transactionId

 - __Path__ : `/v1/transactions/{transactionId}`
 - __HTTP Method__ : GET
  __Logic__ : 
    - Action : returns all the transaction from the DB for a specific transactionId and status (PENDING/SIGNED) (paginated response).
 - __Status code__ :
    - 200 OK.
    - 500 Internal Server Error: An error occurred during the process.
 - __Response__ : 
```
[
  {
    "id" :"transaction_id",
    "transaction_message": "hexadecimal_array_of_bytes",
    "description": "transaction_short_description",
    "hedera_account_id": "your_account_id",
    "signatures": ["signature_1", "signature_2", ...],
    "key_list": ["PK1", "PK2", ...],
    "signed_keys": ["PK1", "PK2", ...],
    "status": "transaction_status",
    "threshold":"number",
    "signatures": ["signature_1", "signature_2", ...]
  },
  {...}
]
```

## Delete all transactions
This functionality is not exposed through the API. It is meant to be used for testing purposes only.
To delete all transactions from the DB, run the following command:
```shell
npm run deleteAllTransactions
```

# Technologies

- Typescript
- NestJS
- TypeORM
- Winston
- Postgres
- Docker

# Installation

The command below can be used to install the official release from the NPM repository. This version may not reflect the most recent changes to the main branch of this repository.

```bash
npm install -g @hashgraph/stablecoin-npm-backend
```

# Build

Run `npm install`. This will create and populate `node_modules` and build the project and dependencies.

Then run `npm run build`. This will create and populate the `dist` folder with the transpiled javascript files.

# Run

In order to run the backend you will need to execute the docker compose yaml file that defines the entire application (DB + API).

Run `docker compose up -d --build`. This will start two containers (one for the API, another one for the DB), their respectives volumes and the network for them to communicate with each other.

The application will use two ports (defined in the .env file):
 - Port `SERVER_PORT`: This is the API port, it can be accessed from outside the docker project.
 - Port `DB_PORT`: This is the DB port, it is only accessible from within the docker network.

# Configuration

There is a `.env` file that must be used to configure the backend. These are the configuration parameters:

- `COMPOSE_PROJECT_NAME`: Name of the docker compose project.
- `CONTAINER_BACK_NAME`: Name of the container running the NestJS API.
- `CONTAINER_DB_NAME`: Name of the container running the postgres DB.
- `DOCKER_NETWORK_NAME`: Name of the docker compose network.
- `SERVER_HOST`: API server name.
- `SERVER_PORT`: API port. This port will be exposed outside of the docker network so that anyone can reach it.
- `DB_HOST`: DB server name.
- `DB_PORT`: DB port. This port will not be exposed outside of the docker network, which means that it is only accessible to the API.
- `DB_USER`: DB admin user name.
- `DB_PASSWORD`: DB admin user password.
- `DB_NAME`: DB name.
- `ORIGIN`: List of urls that are accepted in the HTTP header "Origin". If the API endpoints are invoked from a different url, the request will fail.
- `MAX_LOG_FILESIZE`: Max size of the logging files used by the Winston file rotation policy. If a log file reaches this size, it will be zipped and a new file will be created.
- `LOG_LEVEL`: Minimum log level to be included in the loging files.
- `FILE_NAME`: Log file name pattern and localtion.
- `DATE_PATTERN`: Log file date pattern.
- `AUTO_SUBMIT_JOB_FREQUENCY` : Cron format string that defines the frequency at which the auto submit job runs


# Testing

## Jest

The project uses [Jest](https://jestjs.io/es-ES/) for testing.

## Run

Tests may be run using the following command

```shell
npm run test
```

# Contributing

Contributions are welcome. Please see the
[contributing guide](https://github.com/hashgraph/.github/blob/main/CONTRIBUTING.md)
to see how you can get involved.

# Code of conduct

This project is governed by the
[Contributor Covenant Code of Conduct](https://github.com/hashgraph/.github/blob/main/CODE_OF_CONDUCT.md). By
participating, you are expected to uphold this code of conduct. Please report unacceptable behavior
to [oss@hedera.com](mailto:oss@hedera.com).

# License

[Apache License 2.0](../LICENSE.md)