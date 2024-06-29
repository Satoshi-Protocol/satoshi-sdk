import { Account, createPublicClient, createWalletClient, http } from 'viem';

import { ProtocolConfig } from '../types/config.type';

export function getPublicClientByConfig(config: ProtocolConfig) {
  return createPublicClient({
    chain: config.CHAIN,
    transport: http(),
  });
}

export function getWalletClientByConfig(config: ProtocolConfig, account?: Account) {
  return createWalletClient({
    account: account,
    chain: config.CHAIN,
    transport: http(),
  });
}
