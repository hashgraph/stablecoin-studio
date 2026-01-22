<div align="center">

# Stablecoin Studio - Backend

[![License](https://img.shields.io/badge/license-apache2-blue.svg)](LICENSE)

</div>

# Table of Contents

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

- They will first add the "raw transaction" (unsigned string of bytes) to the backend's api.
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
- **Database**: the db where transactions