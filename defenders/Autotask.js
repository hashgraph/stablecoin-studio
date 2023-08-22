/**
 * This Open Zeppelin Defenders Autotask adds contract's Id to a sentinel defined by "SUBSCRIBER_ID"
 * It is meant to be triggered by another Sentinel monitoring the "Deployed((address,address,address,address,address,address))" event of a Factory.
 * The contracts Id added by the autotask correspond to the Stable Coins deployed by the factory.
 * The Sentinel this autotask is adding contracts Id to is supposed to monitor Stable Coin events.
  */ 

const { SentinelClient } = require('defender-sentinel-client')  

exports.handler = async function (payload) {  
  const credentials = {
    apiKey: payload.secrets.API_KEY,
    apiSecret: payload.secrets.API_SECRET
  };
   
  const conditionRequest = payload.request.body;
    
  if(conditionRequest.matchReasons[0].signature != "Deployed((address,address,address,address,address,address))")return conditionRequest.matchReasons[0].signature;
  const newCloneAddress = conditionRequest.matchReasons[0].args[0][0];
    
  const sentinelClient = new SentinelClient(credentials)
  const subscriberId = 'SUBSCRIBER_ID'
  const sentinel = await sentinelClient.get(subscriberId)
  const subscribedAddresses = sentinel.addressRules[0].addresses
  subscribedAddresses.push(newCloneAddress)
  await sentinelClient.update(subscriberId, { addresses: subscribedAddresses })
  
  return "SUCCESS";
};
