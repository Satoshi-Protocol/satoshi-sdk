import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

import { nymWithdraw } from '../writeContracts/nym/nexusYieldManager';

export const doNymWithdraw = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const hash = await nymWithdraw({
    publicClient,
    walletClient,
    protocolConfig,
    asset,
  });

  return hash;
};
