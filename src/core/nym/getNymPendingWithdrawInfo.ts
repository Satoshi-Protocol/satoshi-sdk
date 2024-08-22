import { PublicClient } from 'viem';

import { ProtocolConfig } from 'src/types';

export const getNymPendingWithdrawInfo = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  assets: `0x${string}`[] | undefined,
  receiver: `0x${string}` | undefined
) => {
  if (!assets?.length) return [];
  const nymAddress = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS;
  const result = assets.map(asset => ({
    asset,
    withdrawalTime: 0n,
    scheduledWithdrawalAmount: 0n,
  }));
  if (!nymAddress || !receiver) return result;

  try {
    const [scheduledWithdrawalAmounts, withdrawalTimes] = (await publicClient.readContract({
      address: nymAddress,
      abi: protocolConfig.ABI.NexusYieldManager,
      functionName: 'pendingWithdrawals',
      args: [assets, receiver],
    })) as [bigint[], bigint[]];

    return assets.map((asset, index) => ({
      asset,
      withdrawalTime: withdrawalTimes[index],
      scheduledWithdrawalAmount: scheduledWithdrawalAmounts[index],
    }));
  } catch (error) {
    console.error('getNymMultiplePendingWithdrawInfo', error);
    console.log({
      error,
    });
  }
};
