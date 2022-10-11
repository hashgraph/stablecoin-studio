export const mockedStableCoinsList = [
	{ symbol: 'HBAR', id: '0.0.123' },
	{ symbol: 'EXP', id: '0.0.13234' },
	{ symbol: 'MCC', id: '0.0.48451290'},
  { symbol: 'MCC2', id: '0.0.48471242'},
  { symbol: 'MCC3', id: '0.0.48478857'}
];

export const mockedSelectedStableCoin =  {
  initialSupply: '0',
  tokenId: '0.0.48471242',
  totalSupply: '100000',
  name: 'ManuCoin2',
  symbol: 'MCC2',
  decimals: 3,
  id: '0.0.48471242',
  maxSupply: '0',
  treasuryId: '0.0.48450590',
  memo: '0.0.48471238',
  adminKey: {
    key: 'cd7c243a37c4d151d0fff6197115007d3f9aa44f69ab92df0c3b9a25bc31a622',
    type: 'ED25519',
  },
  freezeKey: {
    id: '0.0.48471240',
  },
  wipeKey: {
    id: '0.0.48471240',
  },
  supplyKey: {
    key: 'cd7c243a37c4d151d0fff6197115007d3f9aa44f69ab92df0c3b9a25bc31a622',
    type: 'ED25519',
  },
}

export const mockedWalletData = {
  topic: 'da96975a-ebd9-4382-98f8-41fe25bc2b6b',
  pairingString: 'eWNvbiI6ImNzbHRpQWNjb3VudCI6ZmFsc2V9',
  encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
  savedPairings: [
    {
      accountIds: ['0.0.48450590'],
      metadata: {
        name: 'HashPack',
        description: 'An example wallet',
        icon: 'https://www.hashpack.app/img/logo.svg',
        url: 'chrome&#45;extension&#58;&#47;&#47;gjagmgiddbbciopjhllkdnddhcglnemk',
        encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
      },
      network: 'testnet',
      topic: 'da96975a-ebd9-4382-98f8-41fe25bc2b6b',
      origin: 'chrome-extension://gjagmgiddbbciopjhllkdnddhcglnemk',
      encryptionKey: 'XdXXecXX-XcXc-XbaX-bXXd-XXXbXXXXcXXX',
      lastUsed: 1664888808450,
    },
  ],
}
