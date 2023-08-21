# Accelerator integration with Defender
OpenZeppelin Defenders is a platform that can be used to monitor smart contracts activities, automate scripts that can call smart contracts, etc...
For more information about OZ Defenders you can check their website : https://docs.openzeppelin.com/defender/

The Accelerator can be easily integrated with Defenders following the steps below.
IMPORTANT : the integration we provide only includes the following:
- Sentinel monitoring the factory contract's events (defined by the "FACTORY_ID" configured in the "config.json" file). When an event is detected an email is sent to the "EMAIL" (configured in the "config.json" file) and an autotask (described below) gets trigerred. 
- Autotask that gets trigerred by the Sentinel monitoring the factory contract. this task will add the new stable coin contract ID to the Sentinel monitoring the stable coin events (described below).
- Sentinel monitoring the stable coin events. The stable coin contract Ids are added by the above described autotask every time someone deploys a new stable coin using the Factory defined in the "config.json".


## Prerequisites
In order to integrate the accelerator with Defenders you must have a Defenders account with its corresponding "TEAM API KEY" and "TEAM API SECRET".
You must also install serverless, this is a prerequisite tu using "defenders serverless" which is the functionality used to deploy the defenders sentinels and autotask, for more information please check : https://docs.openzeppelin.com/defender/serverless-plugin

## Deployment
- Install all the dependencies defined in the "defenders" project running : **npm i**
- make sure that you have a "config.json" in the "accelerator-service" folder with the proper configuration (check the "config.json.template" file)
- go to "accelerator-service"
- run "sls deploy"
- The Sentinels and Autotask should have been deployed in your Defenders

## Post-deployment
- You must update the autotask script now and add the following information
    - API_KEY : an api key that autotask will use to automatically add Stable Coin contracts id to the Sentinel monitoring the stable coin events.
    - API_SECRET : the corresponding Secret to the API_KEY mentionned above
    - SUBSCRIBER_ID : the subscriber Id of the Sentinel monitoring the stable coin events.


