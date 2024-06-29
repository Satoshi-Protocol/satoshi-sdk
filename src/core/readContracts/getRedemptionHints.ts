import { PublicClient } from 'viem';

import { ProtocolConfig } from '@/types';

export const getRedemptionHints = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  debtAmt: bigint,
  price: bigint,
  maxIterations: bigint
) => {
  const getRedemptionHintsRes = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS,
    abi: protocolConfig.ABI.MULTI_COLLATERAL_HINT_HELPERS,
    functionName: 'getRedemptionHints',
    args: [troveManagerAddr, debtAmt, price, maxIterations],
  })) as getRedemptionHintsRes;
  const firstRedemptionHint = getRedemptionHintsRes[0];
  const partialRedemptionHintNICR = getRedemptionHintsRes[1];
  const truncatedDebtAmount = getRedemptionHintsRes[2];

  return {
    firstRedemptionHint,
    partialRedemptionHintNICR,
    truncatedDebtAmount,
  };
};

type getRedemptionHintsRes = [`0x${string}`, bigint, bigint];
