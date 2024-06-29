import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export enum TroveStatus {
  nonExistent = 0,
  active = 1,
  closedByOwner = 2,
  closedByLiquidation = 3,
  closedByRedemption = 4,
}

export type Trove = {
  debt: bigint;
  coll: bigint;
  stake: bigint;
  status: TroveStatus;
  arrayIndex: bigint;
  activeInterestIndex: bigint;
};

export type GetTrovesRes = [
  bigint, // debt
  bigint, // coll
  bigint, // stake
  number, // status
  bigint, // arrayIndex
  bigint // activeInterestIndex
];

export const getTroves = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  borrowerAddr: `0x${string}`
) => {
  const res = (await publicClient.readContract({
    address: troveManagerAddr,
    abi: protocolConfig.ABI.TROVE_MANAGER,
    functionName: 'troves',
    args: [borrowerAddr],
  })) as GetTrovesRes;

  const trove: Trove = {
    debt: res[0],
    coll: res[1],
    stake: res[2],
    status: res[3],
    arrayIndex: res[4],
    activeInterestIndex: res[5],
  };
  return trove;
};
