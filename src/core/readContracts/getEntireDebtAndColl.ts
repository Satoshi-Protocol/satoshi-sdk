import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export type getEntireDebtAndCollRes = [
  bigint, // debt
  bigint, // coll
  bigint, // pendingDebtReward
  bigint // pendingCollateralReward
];

export const getEntireDebtAndColl = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  borrower: `0x${string}`
) => {
  const result = (await publicClient.readContract({
    address: troveManagerAddr,
    abi: protocolConfig.ABI.TROVE_MANAGER,
    functionName: 'getEntireDebtAndColl',
    args: [borrower],
  })) as getEntireDebtAndCollRes;

  return {
    debt: result[0],
    coll: result[1],
    pendingDebtReward: result[2],
    pendingCollateralReward: result[3],
  };
};
