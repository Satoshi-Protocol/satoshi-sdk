import { PublicClient, WalletClient } from 'viem';

import { CollateralConfig, ProtocolConfig } from '../../types';

export const claimCollateral = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  address,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  address: `0x${string}`;
}): Promise<`0x${string}`> => {
  switch (protocolConfig.CHAIN.id) {
    default:
      return _claimCollateral({
        publicClient,
        walletClient,
        protocolConfig,
        collateral,
        address,
      });
  }
};

export const _claimCollateral = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  address,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  address: `0x${string}`;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    abi: protocolConfig?.ABI.TROVE_MANAGER,
    functionName: 'claimCollateral',
    args: [address],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
