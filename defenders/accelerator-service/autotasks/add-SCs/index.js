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
