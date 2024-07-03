import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getCompoundedDebtDeposit = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  depositor: `0x${string}`
) => {
  const totalDebtTokenDeposits = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS,
    abi: protocolConfig.ABI.STABILITY_POOL,
    functionName: 'getCompoundedDebtDeposit',
    args: [depositor],
  })) as bigint;

  return totalDebtTokenDeposits;
};
