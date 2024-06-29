import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export type ApproxHint = {
  hintAddress: `0x${string}`;
  diff: bigint;
  latestRandomSeed: bigint;
};

export type GetApproxHintRes = [`0x${string}`, bigint, bigint];

export const getApproxHint = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  NICR: bigint,
  numTrials: bigint,
  randomSeed: bigint
) => {
  const getApproxHintRes = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS,
    abi: protocolConfig.ABI.MULTI_COLLATERAL_HINT_HELPERS,
    functionName: 'getApproxHint',
    args: [troveManagerAddr, NICR, numTrials, randomSeed],
  })) as GetApproxHintRes;
  const approxHint: ApproxHint = {
    hintAddress: getApproxHintRes[0],
    diff: getApproxHintRes[1],
    latestRandomSeed: getApproxHintRes[2],
  };
  return approxHint;
};
