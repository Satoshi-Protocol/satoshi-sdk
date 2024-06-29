import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getNumTroves = async ({
  publicClient,
  protocolConfig,
  sortedTrovesAddr,
}: {
  publicClient: PublicClient;
  protocolConfig: ProtocolConfig;
  sortedTrovesAddr: `0x${string}`;
}) => {
  const numTroves = (await publicClient.readContract({
    address: sortedTrovesAddr,
    abi: protocolConfig.ABI.SORTED_TROVES,
    functionName: 'getSize',
    args: [],
  })) as bigint;
  return numTroves;
};
