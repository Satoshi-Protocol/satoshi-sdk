import { PublicClient } from 'viem';

import { ProtocolConfig } from '@/types';

export const getBorrowingFee = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  netDebtAmt: bigint
) => {
  const borrowingFee = (await publicClient.readContract({
    address: troveManagerAddr,
    abi: protocolConfig.ABI.TROVE_MANAGER,
    functionName: 'getBorrowingFeeWithDecay',
    args: [netDebtAmt],
  })) as bigint;
  return borrowingFee;
};
