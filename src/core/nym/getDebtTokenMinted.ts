import { PublicClient } from 'viem';

import { ProtocolConfig } from 'src/types';

export const getDebtTokenMinted = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  asset: `0x${string}` | undefined
) => {
  if (!asset) return undefined;
  if (!protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS) return undefined;
  const debtTokenMinted = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS,
    abi: protocolConfig.ABI.NEXUS_YIELD_MANAGER,
    functionName: 'debtTokenMinted',
    args: [asset],
  })) as bigint;
  return debtTokenMinted;
};
