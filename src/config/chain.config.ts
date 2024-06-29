import { defineChain } from 'viem';

export const bevm_mainnet = defineChain({
  id: 11501,
  name: 'BEVM Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-mainnet-1.bevm.io/', 'https://rpc-mainnet-2.bevm.io'],
      webSocket: ['wss://rpc-mainnet-1.bevm.io/ws'],
    },
    public: {
      http: ['https://rpc-mainnet-1.bevm.io/', 'https://rpc-mainnet-2.bevm.io'],
      webSocket: ['wss://rpc-mainnet-1.bevm.io/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://scan-mainnet.bevm.io/' },
  },
  contracts: {},
});

export const bitlayer_mainnet = defineChain({
  id: 200901,
  name: 'Bitlayer Mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Bitcoin',
    symbol: 'BTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bitlayer.org', 'https://rpc.bitlayer-rpc.com'],
      webSocket: ['wss://ws.bitlayer.org', 'wss://ws.bitlayer-rpc.com'],
    },
    public: {
      http: ['https://rpc.bitlayer.org', 'https://rpc.bitlayer-rpc.com'],
      webSocket: ['wss://ws.bitlayer.org', 'wss://ws.bitlayer-rpc.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://www.btrscan.com' },
  },
  contracts: {},
});
