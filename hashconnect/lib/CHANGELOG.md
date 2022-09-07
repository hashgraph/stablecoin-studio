## v0.2.2
- Fixed false pairing event when refreshing with no pairings
- Fixed not subscribing to topic on second refresh when no pairings
- Manually calling generatePairingString() now updates the pairing string in hcData
- Fixed disconnect unsubscribing from dapp topics, was only useful for wallets
  - Note, we reccommend dapps using disconnect() rather than clearConnectionsAndData(), the latter should be used for testing and resetting the state
   
## v0.2.1
- Fixed issue initializing with legacy hashconnect data

## v0.2.0
- Streamlined setup
- Added 'hideNft' option to transactions
- Made connectionStatusChangeEvent work correctly
- Added lastUsed metadata to pairing data
- Added disconnect function
- No longer need to use https to test extension connectivity
- Automatically send pairing request if embedded in an iframe

## v0.1.10
- Added iframe connection logic

## v0.1.6
- Added provider/signer (HIP-338) functionality
- Added transaction response in addition to receipt
  
## v0.1.5
- Refactored authentication to be more secure

## v0.1.4
- Added authentication functionality
  - Please see documentation for details

## v0.1.3

- Added this changelog file
- Automatically retry connection to websocket when the connection is severed - for example when the server reboots
- Added ```connectionStatusChange``` event, fires a connected/disconnected event when the server connection changes
- Converted sendTransaction and requestAdditionalAccounts to promises instead of events