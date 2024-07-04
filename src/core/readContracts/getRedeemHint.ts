import { PublicClient, maxUint256 } from 'viem';

import { getApproxHint } from './getApproxHint';
import { getInsertPosition } from './getInsertPosition';
import { getNumTroves } from './getNumTroves';
import { getRedemptionHints } from './getRedemptionHints';
import { RANDOM_SEED, TRIAL_NUMBER } from '../../config';
import { ProtocolConfig } from '../../types';

export type Hint = {
  redemptionHints: {
    firstRedemptionHint: `0x${string}`;
    partialRedemptionHintNICR: bigint;
    truncatedDebtAmount: bigint;
  };
  upperHint: `0x${string}`;
  lowerHint: `0x${string}`;
};

export const getRedeemHint = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
    sortedTrovesAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
    sortedTrovesAddr: `0x${string}`;
  },
  debtAmt: bigint,
  price: bigint,
  maxIterations: bigint
): Promise<Hint | undefined> => {
  const redemptionHints = await getRedemptionHints(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr,
    },
    debtAmt,
    price,
    maxIterations
  );
  if (!redemptionHints) return undefined;

  const approxHint = await getApproxHint(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr,
    },
    redemptionHints.partialRedemptionHintNICR,
    BigInt(TRIAL_NUMBER),
    BigInt(RANDOM_SEED)
  );
  const res = await getInsertPosition(
    {
      publicClient,
      protocolConfig,
      sortedTrovesAddr,
    },
    redemptionHints.partialRedemptionHintNICR,
    approxHint?.hintAddress,
    approxHint?.hintAddress
  );
  if (res) {
    const upperHint = res.upperHint;
    const lowerHint = res.lowerHint;
    return { redemptionHints, upperHint, lowerHint };
  } else {
    return undefined;
  }
};
