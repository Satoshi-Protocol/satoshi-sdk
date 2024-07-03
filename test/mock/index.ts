import { defineChain, createPublicClient, http } from 'viem';

import { ProtocolConfig, ProtocolConfigMap } from '../../src';

function getPublicClientByConfig(config: ProtocolConfig) {
  return createPublicClient({
    chain: config.CHAIN,
    transport: http(),
  });
}

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

export const mock_bitlayer_mainnet = defineChain({
  id: 200901,
  name: 'Mock Bitlayer Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8546'],
      webSocket: [],
    },
    public: {
      http: ['http://127.0.0.1:8546'],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://www.btrscan.com' },
  },
  contracts: {},
});

export const MOCK_BEVM_MAINNET: ProtocolConfig = {
  ...ProtocolConfigMap.BEVM_MAINNET,
  CHAIN: mock_bevm_mainnet,
};

export const MOCK_BITLAYER_MAINNET: ProtocolConfig = {
  ...ProtocolConfigMap.BITLAYER_MAINNET,
  CHAIN: mock_bitlayer_mainnet,
};

export const bevmPublicClient = getPublicClientByConfig(MOCK_BEVM_MAINNET);
export const bitlayerPublicClient = getPublicClientByConfig(MOCK_BITLAYER_MAINNET);