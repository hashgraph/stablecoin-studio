# Accelerator Integration with OZ Defender

### Table of Contents
- **[Introduction](#Introduction)**<br>
- **[Pre-deployment](#Pre-deployment)**<br>
- **[Deployment](#Deployment)**<br>
- **[Post-deployment](#Post-deployment)**<br>
- **[Caveats](#Caveats)**<br>

## Introduction
This module includes everything required to monitor your factory and stable coins using the Open Zeppelin Defenders platform.

_For more information on OZ Defenders check their [official documentation](https://docs.openzeppelin.com/defender/)._

Serverless will be used to deploy the whole configuration which consists of:

- Sentinel monitoring the factory. Everytime a new stable coin is deployed, this Sentinel triggers the autotask described below.
- Autotask that extracts the address of the newly deployed stable coin and adds it to the sentinel described below.
- Sentinel monitoring the stable coins deployed from the factory.

Both sentinels monitor all the events defined in the Factory and Hedera Token Manager abis and send notifications to an email address (defined in the "config.yml").


## Pre-deployment
Before deploying the serverless configuration in OZ Defenders, you must connect to your Defenders Tenant and create a Team API Key/Secret with at least the following permissions:
- Manage Autotasks
- Manage Sentinels
- Manage Deployments

Then follow these steps:

- Create a **config.yml** based on the "config.template.yml".
- Enter the **Team API Key/Secret** mentionned above.
- Enter an **email** address that will be notified of all events detected by the two sentinels described in the "Introduction".
- Go to **abi/factory/json.abi** and copy the factory abi (*)
- Go to **abi/stablecoin/json.abi** and copy the stablecoin abi (*)

_(*)you can find the factory and stablecoin abis in : "contracts" module > artifacts > contracts > StableCoinFactory.sol / HederaTokenManager.sol > StableCoinFactory.json / HederaTokenManager.json > abi_

## Deployment

Run the following serverless command

_sls deploy_

## Post-deployment
Log in your Defender tenant and follow these steps:

- Go to the **Autotask** section.
- Click on **Edit code** of the newly deployed autotask named **Accelerator New StableCoin**
- Replace **SUBSCRIBER_ID** with the subscriber Id of the Sentinel monitoring the stable coins (*)
- **Save** your changes.
- Create a **Team API Key/Secret** (check OZ documentation)
- Create an **Autotask secret**, call it **API_KEY** and enter the Team API Key created in the step before.
- Create an **Autotask secret**, call it **API_SECRET** and enter the Team API Secret created in the step before.


_(*)you can get the subscriber id of a sentinel from the url when you select it : https://defender.openzeppelin.com/#/sentinel/**SUBSCRIBER_ID**._


## Caveats
The events monitored by the Sentinels are hardcoded into the **serverless.yml** file, which means that if for any reason the *StableCoinFactory* and/or *HederaTokenManager* change, sentinels might not work as expected.

All notifications are sent to the same email address, this has been decided like that for simplicity reasons, you can change the notification policy at any time from the Defenders UI.
