import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getNominalICR = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  address: `0x${string}`
) => {
  const NICR = (await publicClient.readContract({
    address: troveManagerAddr,
    abi: protocolConfig.ABI.TROVE_MANAGER,
    functionName: 'getNominalICR',
    args: [address],
  })) as bigint;
  return NICR;
};
