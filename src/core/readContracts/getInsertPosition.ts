import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export type findInsertPositionRes = [`0x${string}`, `0x${string}`];

export const getInsertPosition = async (
  {
    publicClient,
    protocolConfig,
    sortedTrovesAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    sortedTrovesAddr: `0x${string}`;
  },
  NICR: bigint,
  prevId: `0x${string}`,
  nextId: `0x${string}`
) => {
  const findInsertPositionRes = (await publicClient.readContract({
    address: sortedTrovesAddr,
    abi: protocolConfig.ABI.SORTED_TROVES,
    functionName: 'findInsertPosition',
    args: [NICR, prevId, nextId],
  })) as findInsertPositionRes;
  const upperHint = findInsertPositionRes[0];
  const lowerHint = findInsertPositionRes[1];
  return { upperHint, lowerHint };
};
