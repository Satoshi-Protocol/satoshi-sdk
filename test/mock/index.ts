import { defineChain } from 'viem';

import { ProtocolConfig, ProtocolConfigMap } from '../../src';

export const mock_bevm_mainnet = defineChain({
  id: 11501,
  name: 'Mock BEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
      webSocket: [],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://scan-mainnet.bevm.io/' },
  },
  contracts: {},
});

export const MOCK_BEVM_MAINNET: ProtocolConfig = {
  ...ProtocolConfigMap.BEVM_MAINNET,
  CHAIN: mock_bevm_mainnet,
};
