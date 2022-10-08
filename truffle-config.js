const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonicPhrase = "lawsuit sting mobile rack problem sick uncover short luggage notice seed sudden"; // 12 word mnemonic

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*"
    },
    goerli: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonicPhrase
        },
        providerOrUrl: "https://goerli.infura.io/v3/918b986adeda41da901d8ce8a0245b34",
        numberOfAddresses: 1,
        shareNonce: true,
        derivationPath: "m/44'/1'/0'/0/"
      }),
      network_id: 5
    },
    dashboard: {
    }
  },
  compilers: {
    solc: {
      version: "0.8.17",
    }
  },
  db: {
    enabled: false,
    host: "127.0.0.1",
  }
};
